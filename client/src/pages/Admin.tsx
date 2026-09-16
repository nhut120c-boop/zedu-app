import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ClipboardCheck, FilePlus2, Plus, Send, Users, Paperclip, Eye, EyeOff, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
function readFileAsDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Không thể đọc file.")); reader.readAsDataURL(file); }); }

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const canManage = Boolean(user?.canManage);
  const overview = trpc.learning.adminOverview.useQuery(undefined, { enabled: isAuthenticated && canManage, retry: false });
  const utils = trpc.useUtils();
  
  const [tab, setTab] = useState<"assignment" | "lesson">("assignment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  
  const createAssignment = trpc.learning.createAssignment.useMutation({ onSuccess: async () => { toast.success("Đã tạo bài tập."); setTitle(""); setDescription(""); setFile(null); await utils.learning.adminOverview.invalidate(); }, onError: e => toast.error(e.message) });
  const createLesson = trpc.learning.createLesson.useMutation({ onSuccess: async () => { toast.success("Đã tạo bài học."); setTitle(""); setSummary(""); setContent(""); await utils.learning.adminOverview.invalidate(); }, onError: e => toast.error(e.message) });
  const grade = trpc.learning.gradeSubmission.useMutation({ onSuccess: async () => { toast.success("Đã lưu điểm và phản hồi."); setGradingId(null); setScore(""); setFeedback(""); await utils.learning.adminOverview.invalidate(); }, onError: e => toast.error(e.message) });
  const toggleVisibility = trpc.learning.toggleAssignmentVisibility.useMutation({ onSuccess: () => utils.learning.adminOverview.invalidate(), onError: e => toast.error(e.message) });

  if (loading) return <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c9d7d7] border-t-[#e87560]" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen bg-[#f7f5f0] p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#163454]">Đăng nhập để tiếp tục</h1><p className="mt-3 text-slate-500">Khu vực này dành cho giáo viên.</p></div>;
  if (!canManage) return <div className="min-h-screen bg-[#f7f5f0] p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#163454]">Khu vực dành cho giáo viên</h1><p className="mt-3 text-slate-500">Tài khoản của bạn chưa được cấp quyền quản lý lớp học.</p></div>;
  
  const submitContent = async () => { 
    if (tab === "assignment") {
      try {
        const attachmentData = file ? await readFileAsDataUrl(file) : undefined;
        createAssignment.mutate({ title, description, maxScore: 100, attachmentData, attachmentName: file?.name, attachmentType: file?.type });
      } catch (error) {
        toast.error("Không thể đọc file đính kèm.");
      }
    } else {
      createLesson.mutate({ title, summary, content, durationMinutes: 30 });
    }
  };
  
  const startGrading = (item: any) => { setGradingId(item.id); setScore(item.score?.toString() || ""); setFeedback(item.feedback || ""); };

  return (
    <DashboardLayout eyebrow="Dành cho giáo viên" title="Quản lý lớp học" description="Tạo bài học, giao bài tập, chấm điểm và gửi nhận xét cho học viên.">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 md:grid-cols-3">
          <Kpi label="Bài tập" value={overview.data?.assignments.length ?? 0} icon={<ClipboardCheck size={18} />} />
          <Kpi label="Bài nộp" value={overview.data?.submissions.length ?? 0} icon={<Users size={18} />} />
          <Kpi label="Đã chấm" value={overview.data?.submissions.filter(item => item.status === "graded").length ?? 0} icon={<Send size={18} />} />
        </div>
        
        <div className="mt-7 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <section className="rounded-[26px] bg-[#163454] p-6 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9d7c6]">
              <FilePlus2 size={15} /> Tạo nội dung
            </div>
            <div className="mt-5 flex gap-2 rounded-xl bg-white/10 p-1">
              <button onClick={() => setTab("assignment")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${tab === "assignment" ? "bg-[#f4c8bd] text-[#163454]" : "text-white/60"}`}>Bài tập</button>
              <button onClick={() => setTab("lesson")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${tab === "lesson" ? "bg-[#f4c8bd] text-[#163454]" : "text-white/60"}`}>Bài học</button>
            </div>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề" className="mt-6 border-white/10 bg-white/10 text-white placeholder:text-white/35" />
            {tab === "assignment" ? (
              <>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả yêu cầu bài tập" className="mt-3 min-h-36 border-white/10 bg-white/10 text-white placeholder:text-white/35" />
                <div className="mt-3 rounded-lg bg-white/5 p-3">
                  <label className="flex max-w-full cursor-pointer items-center gap-2 truncate text-white/70 hover:text-white">
                    <Paperclip size={15} />
                    <span className="truncate">{file ? file.name : "Đính kèm file PDF/DOCX (tối đa 10MB)"}</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => {
                      const next = e.target.files?.[0];
                      if (next && next.size > MAX_FILE_SIZE) { toast.error("File tối đa 10MB."); return; }
                      setFile(next || null);
                    }} />
                  </label>
                </div>
              </>
            ) : (
              <>
                <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Tóm tắt bài học" className="mt-3 border-white/10 bg-white/10 text-white placeholder:text-white/35" />
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung bài học" className="mt-3 min-h-36 border-white/10 bg-white/10 text-white placeholder:text-white/35" />
              </>
            )}
            <Button disabled={!title.trim() || (tab === "assignment" ? !description.trim() : !content.trim()) || createAssignment.isPending || createLesson.isPending} onClick={submitContent} className="mt-4 w-full rounded-xl bg-[#f4c8bd] text-[#163454] hover:bg-[#f7d8d0]">
              <Plus size={16} /> {tab === "assignment" ? (createAssignment.isPending ? "Đang tạo..." : "Tạo bài tập") : (createLesson.isPending ? "Đang tạo..." : "Tạo bài học")}
            </Button>
          </section>
          
          <section className="rounded-[26px] border border-[#dbe3e0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e87560]">Đánh giá</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Bài nộp gần đây</h2>
              </div>
              <span className="rounded-full bg-[#e8f1ed] px-3 py-1 text-xs font-bold text-[#398266]">Giáo viên</span>
            </div>
            <div className="mt-5 space-y-3">
              {overview.data?.submissions.map(item => (
                <div key={item.id} className="rounded-2xl bg-[#f7f5f0] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff1e9] text-[#398266]"><Send size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{item.studentName}</div>
                      <div className="mt-1 truncate text-xs text-slate-400">{item.assignmentTitle} · {new Date(item.submittedAt).toLocaleString("vi-VN")}{item.attachmentName ? ` · ${item.attachmentName}` : ""}</div>
                      {item.attachmentUrl && <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-[#398266] underline">Mở file đính kèm</a>}
                    </div>
                    <span className="rounded-full bg-[#dff1e9] px-2.5 py-1 text-[10px] font-bold text-[#398266]">{item.status === "graded" ? `${item.score} điểm` : "Chưa chấm"}</span>
                    <Button size="sm" onClick={() => startGrading(item)} className="rounded-xl bg-[#163454] text-white hover:bg-[#24476a]">{item.status === "graded" ? "Sửa" : "Chấm"}</Button>
                  </div>
                  {gradingId === item.id && (
                    <div className="mt-4 grid gap-3 border-t border-[#dbe3e0] pt-4 sm:grid-cols-[120px_1fr_auto]">
                      <Input type="number" min={0} max={1000} value={score} onChange={e => setScore(e.target.value)} placeholder="Điểm" className="bg-white" />
                      <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Phản hồi chi tiết cho học viên" className="min-h-20 bg-white" />
                      <Button disabled={!score || !feedback.trim() || grade.isPending} onClick={() => grade.mutate({ submissionId: item.id, score: Number(score), feedback })} className="rounded-xl bg-[#e87560] text-white hover:bg-[#d96350]">Lưu</Button>
                    </div>
                  )}
                </div>
              ))}
              {!overview.data?.submissions.length && <div className="rounded-2xl bg-[#f7f5f0] p-10 text-center text-sm text-slate-400">Chưa có bài nộp nào.</div>}
            </div>
          </section>
        </div>

        <div className="mt-7">
          <section className="rounded-[26px] border border-[#dbe3e0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e87560]">Quản lý</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Danh sách bài tập</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {overview.data?.assignments.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f7f5f0] p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.visible ? "bg-[#dff1e9] text-[#398266]" : "bg-slate-200 text-slate-500"}`}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="truncate text-sm font-bold">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.visible ? "Đang hiển thị" : "Đang ẩn"}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" disabled={toggleVisibility.isPending} onClick={() => toggleVisibility.mutate({ assignmentId: item.id, visible: item.visible ? 0 : 1 })}>
                    {item.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="ml-2">{item.visible ? "Ẩn" : "Hiện"}</span>
                  </Button>
                </div>
              ))}
              {!overview.data?.assignments.length && <div className="rounded-2xl bg-[#f7f5f0] p-10 text-center text-sm text-slate-400">Chưa có bài tập nào.</div>}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <div className="rounded-[22px] border border-[#dbe3e0] bg-white p-5"><div className="flex items-center justify-between text-slate-400"><span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span>{icon}</div><div className="mt-4 font-display text-3xl font-bold text-[#163454]">{value}</div></div>; }
