import type { Assignment, InsertUser, Lesson, Message, Submission, User } from "../drizzle/schema";
import { getSupabaseAdmin } from "./supabase";

function client() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase database is not configured");
  return supabase;
}

function userFromRow(row: any): User {
  return { id: Number(row.id), openId: row.open_id, name: row.name, email: row.email, loginMethod: row.login_method, role: row.role, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at), lastSignedIn: new Date(row.last_signed_in) } as User;
}
function lessonFromRow(row: any): Lesson { return { id: Number(row.id), title: row.title, summary: row.summary, content: row.content, durationMinutes: row.duration_minutes, published: row.published ? 1 : 0, attachmentKey: row.attachment_key, attachmentName: row.attachment_name, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) } as Lesson; }
function assignmentFromRow(row: any): Assignment { return { id: Number(row.id), title: row.title, description: row.description, dueAt: row.due_at ? new Date(row.due_at) : null, maxScore: row.max_score, attachmentKey: row.attachment_key, attachmentName: row.attachment_name, visible: row.visible ?? 1, createdBy: row.created_by, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) } as Assignment; }
function submissionFromRow(row: any): Submission { return { id: Number(row.id), assignmentId: Number(row.assignment_id), studentId: Number(row.student_id), answerText: row.answer_text, attachmentUrl: row.attachment_url, attachmentKey: row.attachment_key, attachmentName: row.attachment_name, status: row.status, score: row.score, feedback: row.feedback, submittedAt: new Date(row.submitted_at), updatedAt: new Date(row.updated_at) } as Submission; }
function messageFromRow(row: any): Message { return { id: Number(row.id), senderId: Number(row.sender_id), recipientId: Number(row.recipient_id), body: row.body, readAt: row.read_at ? new Date(row.read_at) : null, createdAt: new Date(row.created_at) } as Message; }

export async function getUserByOpenId(openId: string) {
  const { data, error } = await client().from("users").select("*").eq("open_id", openId).maybeSingle();
  if (error) throw error;
  return data ? userFromRow(data) : undefined;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const payload: Record<string, unknown> = { open_id: user.openId };
  if (user.name !== undefined) payload.name = user.name;
  if (user.email !== undefined) payload.email = user.email;
  if (user.loginMethod !== undefined) payload.login_method = user.loginMethod;
  if (user.lastSignedIn !== undefined) payload.last_signed_in = user.lastSignedIn.toISOString();
  // role is intentionally never written here; it is managed manually in Supabase.
  const { error } = await client().from("users").upsert(payload, { onConflict: "open_id", ignoreDuplicates: false });
  if (error) throw error;
}

export async function getUsersByIds(ids: number[]) {
  if (!ids.length) return [];
  const { data, error } = await client().from("users").select("id,name,email,role").in("id", ids);
  if (error) throw error;
  return (data || []).map(row => ({ id: Number(row.id), name: row.name, email: row.email, role: row.role }));
}

export async function getPublishedLessons() {
  const { data, error } = await client().from("lessons").select("*").eq("published", true).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(lessonFromRow);
}
export async function getAssignments() {
  const { data, error } = await client().from("assignments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(assignmentFromRow);
}
export async function getSubmissionsForStudent(studentId: number) {
  const { data, error } = await client().from("submissions").select("*").eq("student_id", studentId).order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(submissionFromRow);
}
export async function getSubmissionById(id: number) {
  const { data, error } = await client().from("submissions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? submissionFromRow(data) : undefined;
}
export async function getSubmissionForAssignment(studentId: number, assignmentId: number) {
  const { data, error } = await client().from("submissions").select("*").eq("student_id", studentId).eq("assignment_id", assignmentId).maybeSingle();
  if (error) throw error;
  return data ? submissionFromRow(data) : undefined;
}
export async function getAssignmentById(id: number) {
  const { data, error } = await client().from("assignments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? assignmentFromRow(data) : undefined;
}
export async function createLesson(input: { title: string; summary?: string | null; content?: string | null; durationMinutes: number; attachmentKey?: string | null; attachmentName?: string | null }) {
  const { data, error } = await client().from("lessons").insert({ title: input.title, summary: input.summary || null, content: input.content || null, duration_minutes: input.durationMinutes, attachment_key: input.attachmentKey || null, attachment_name: input.attachmentName || null }).select("id").single();
  if (error) throw error;
  return Number(data.id);
}
export async function createAssignment(input: { title: string; description: string; dueAt?: Date; maxScore: number; attachmentKey?: string | null; attachmentName?: string | null; createdBy: number }) {
  const { data, error } = await client().from("assignments").insert({ title: input.title, description: input.description, due_at: input.dueAt?.toISOString() || null, max_score: input.maxScore, attachment_key: input.attachmentKey || null, attachment_name: input.attachmentName || null, created_by: input.createdBy }).select("id").single();
  if (error) throw error;
  return Number(data.id);
}

export async function updateAssignmentVisibility(id: number, visible: number) {
  const { error } = await client().from("assignments").update({ visible }).eq("id", id);
  if (error) throw error;
}
export async function saveSubmission(input: { id?: number; assignmentId: number; studentId: number; answerText: string; attachmentKey: string | null; attachmentName: string | null }) {
  const payload = { assignment_id: input.assignmentId, student_id: input.studentId, answer_text: input.answerText, attachment_key: input.attachmentKey, attachment_name: input.attachmentName, status: "submitted", score: null, feedback: null, submitted_at: new Date().toISOString() };
  if (input.id) {
    const { error } = await client().from("submissions").update(payload).eq("id", input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await client().from("submissions").insert(payload).select("id").single();
  if (error) throw error;
  return Number(data.id);
}
export async function gradeSubmission(id: number, score: number, feedback: string) {
  const { error } = await client().from("submissions").update({ score, feedback, status: "graded" }).eq("id", id);
  if (error) throw error;
}
export async function getAdminOverview() {
  const [assignments, lessons, submissions] = await Promise.all([
    client().from("assignments").select("*").order("created_at", { ascending: false }),
    client().from("lessons").select("*").order("created_at", { ascending: false }),
    client().from("submissions").select("*").order("submitted_at", { ascending: false }),
  ]);
  if (assignments.error) throw assignments.error;
  if (lessons.error) throw lessons.error;
  if (submissions.error) throw submissions.error;
  return { assignments: (assignments.data || []).map(assignmentFromRow), lessons: (lessons.data || []).map(lessonFromRow), submissions: (submissions.data || []).map(submissionFromRow) };
}
export async function listMessages(userId: number) {
  const { data, error } = await client().from("messages").select("*").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(messageFromRow);
}
export const getMessagesForUser = listMessages;
export async function getMessageRecipients(userId: number, role: "admin" | "student") {
  const query = client().from("users").select("id,name,email").neq("id", userId);
  const { data, error } = role === "admin" ? await query : await query.eq("role", "admin");
  if (error) throw error;
  return (data || []).map(row => ({ id: Number(row.id), label: row.name || row.email || "Thành viên" }));
}
export async function createMessage(senderId: number, recipientId: number, body: string) {
  const { data, error } = await client().from("messages").insert({ sender_id: senderId, recipient_id: recipientId, body }).select("id").single();
  if (error) throw error;
  return Number(data.id);
}
export async function userExists(id: number) {
  const { data, error } = await client().from("users").select("id").eq("id", id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
