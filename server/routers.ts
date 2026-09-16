import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getAssignmentById, getAdminOverview, getMessageRecipients, getMessagesForUser, getSubmissionForAssignment, getSubmissionById, createAssignment, createLesson, createMessage, getPublishedLessons, getAssignments, getSubmissionsForStudent, getUsersByIds, gradeSubmission, saveSubmission, userExists, updateAssignmentVisibility } from "./db";
import { broadcastMessageEvent, getMessageChannel, getSubmissionFileUrl, uploadSubmissionFile, uploadAssignmentFile, getAssignmentFileUrl } from "./supabase";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Bạn không có quyền truy cập khu vực này." });
  return next({ ctx });
});
const attachmentSchema = z.object({ attachmentData: z.string().max(14_000_000).optional(), attachmentName: z.string().trim().max(255).optional(), attachmentType: z.string().trim().max(120).optional() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ? { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email, canManage: ctx.user.role === "admin", messageChannel: getMessageChannel(ctx.user.id) } : null),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  learning: router({
    listLessons: protectedProcedure.query(() => getPublishedLessons()),
    listAssignments: protectedProcedure.query(async ({ ctx }) => {
      const rows = await getAssignments();
      const filteredRows = ctx.user.role === "admin" ? rows : rows.filter(r => r.visible);
      const processedRows = await Promise.all(filteredRows.map(async row => {
        const attachmentUrl = row.attachmentKey ? await getAssignmentFileUrl(row.attachmentKey) : null;
        return { ...row, attachmentUrl };
      }));
      if (ctx.user.role === "admin") return processedRows.map(row => ({ ...row, submissionStatus: null, submittedAt: null }));
      const own = await getSubmissionsForStudent(ctx.user.id);
      const byAssignment = new Map(own.map(item => [item.assignmentId, item]));
      return processedRows.map(row => { const submission = byAssignment.get(row.id); return { ...row, submissionStatus: submission?.status ?? null, submittedAt: submission?.submittedAt ?? null, score: submission?.score ?? null, feedback: submission?.feedback ?? null, attachmentName: submission?.attachmentName ?? null }; });
    }),
    submitAssignment: protectedProcedure.input(z.object({ assignmentId: z.number().int().positive(), answerText: z.string().trim().min(1, "Vui lòng nhập nội dung bài làm.").max(10000), ...attachmentSchema.shape })).mutation(async ({ ctx, input }) => {
      const assignment = await getAssignmentById(input.assignmentId);
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy bài tập." });
      if (input.attachmentData && !input.attachmentName) throw new TRPCError({ code: "BAD_REQUEST", message: "Thiếu tên file đính kèm." });
      let attachmentKey: string | null = null;
      if (input.attachmentData && input.attachmentName) {
        const bytes = Buffer.from(input.attachmentData.replace(/^data:[^;]+;base64,/, ""), "base64");
        if (bytes.length > 10 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "File đính kèm tối đa 10MB." });
        attachmentKey = (await uploadSubmissionFile(ctx.user.id, input.attachmentName, bytes, input.attachmentType || "application/octet-stream")).key;
      }
      const existing = await getSubmissionForAssignment(ctx.user.id, input.assignmentId);
      const id = await saveSubmission({ id: existing?.id, assignmentId: input.assignmentId, studentId: ctx.user.id, answerText: input.answerText, attachmentKey: attachmentKey || existing?.attachmentKey || null, attachmentName: input.attachmentName || existing?.attachmentName || null });
      return { id, updated: Boolean(existing), attachmentName: input.attachmentName || existing?.attachmentName || null };
    }),
    adminOverview: adminProcedure.query(async () => {
      const overview = await getAdminOverview();
      const people = await getUsersByIds(overview.submissions.map(row => row.studentId));
      const names = new Map(people.map(person => [person.id, person.name || person.email || "Học viên"]));
      const assignmentNames = new Map(overview.assignments.map(row => [row.id, row.title]));
      const submissions = await Promise.all(overview.submissions.map(async row => ({ ...row, attachmentUrl: row.attachmentKey ? await getSubmissionFileUrl(row.attachmentKey) : row.attachmentUrl, studentName: names.get(row.studentId) || "Học viên", assignmentTitle: assignmentNames.get(row.assignmentId) || `Bài tập #${row.assignmentId}` })));
      return { assignments: overview.assignments, lessons: overview.lessons, submissions };
    }),
    gradeSubmission: adminProcedure.input(z.object({ submissionId: z.number().int().positive(), score: z.number().int().min(0).max(1000), feedback: z.string().trim().min(1, "Vui lòng nhập phản hồi chi tiết.").max(10000) })).mutation(async ({ input }) => {
      const submission = await getSubmissionById(input.submissionId);
      if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy bài nộp." });
      const assignment = await getAssignmentById(submission.assignmentId);
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy bài tập." });
      if (input.score > assignment.maxScore) throw new TRPCError({ code: "BAD_REQUEST", message: `Điểm không được vượt quá ${assignment.maxScore}.` });
      await gradeSubmission(input.submissionId, input.score, input.feedback);
      return { success: true } as const;
    }),
    createLesson: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(180), summary: z.string().trim().max(500).optional(), content: z.string().trim().max(20000).optional(), durationMinutes: z.number().int().min(5).max(600).default(30) })).mutation(({ input }) => createLesson(input)),
    createAssignment: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(180), description: z.string().trim().min(5).max(10000), dueAt: z.coerce.date().optional(), maxScore: z.number().int().min(1).max(1000).default(100), ...attachmentSchema.shape })).mutation(async ({ ctx, input }) => {
      let attachmentKey: string | null = null;
      if (input.attachmentData && input.attachmentName) {
        const bytes = Buffer.from(input.attachmentData.replace(/^data:[^;]+;base64,/, ""), "base64");
        if (bytes.length > 10 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "File đính kèm tối đa 10MB." });
        attachmentKey = (await uploadAssignmentFile(input.attachmentName, bytes, input.attachmentType || "application/octet-stream")).key;
      }
      return createAssignment({ title: input.title, description: input.description, dueAt: input.dueAt, maxScore: input.maxScore, attachmentKey, attachmentName: input.attachmentName || null, createdBy: ctx.user.id });
    }),
    toggleAssignmentVisibility: adminProcedure.input(z.object({ assignmentId: z.number().int().positive(), visible: z.number().int().min(0).max(1) })).mutation(async ({ input }) => {
      await updateAssignmentVisibility(input.assignmentId, input.visible);
      return { success: true } as const;
    }),
  }),
  messages: router({
    list: protectedProcedure.query(async ({ ctx }) => { const rows = await getMessagesForUser(ctx.user.id); const people = await getUsersByIds(Array.from(new Set(rows.flatMap(row => [row.senderId, row.recipientId])))); const names = new Map(people.map(person => [person.id, person.name || person.email || "Thành viên"])); return rows.map(row => ({ ...row, senderName: names.get(row.senderId) || "Thành viên", recipientName: names.get(row.recipientId) || "Thành viên" })); }),
    recipients: protectedProcedure.query(({ ctx }) => getMessageRecipients(ctx.user.id, ctx.user.role === "admin" ? "admin" : "student")),
    send: protectedProcedure.input(z.object({ recipientId: z.number().int().positive(), body: z.string().trim().min(1).max(4000) })).mutation(async ({ ctx, input }) => { if (input.recipientId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Bạn không thể nhắn cho chính mình." }); if (!(await userExists(input.recipientId))) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy người nhận." }); const id = await createMessage(ctx.user.id, input.recipientId, input.body); await broadcastMessageEvent(input.recipientId, id); return { id }; }),
  }),
});
export type AppRouter = typeof appRouter;
