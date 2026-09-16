import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, PenLine, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

const content = {
  "/on-thi": {
    eyebrow: "Chuẩn bị tốt hơn",
    title: "Ôn thi",
    description: "Tập trung ôn lại kiến thức và chuẩn bị cho những cột mốc quan trọng.",
    icon: ClipboardList,
    accent: "Kho tài liệu ôn thi",
    heading: "Sẵn sàng cho kỳ thi",
    body: "Các chuyên đề, đề cương và bài luyện tập sẽ được sắp xếp tại đây để bạn ôn tập theo từng bước.",
    action: "Xem bài học",
    href: "/lessons",
  },
  "/kiem-tra": {
    eyebrow: "Đánh giá tiến độ",
    title: "Kiểm tra",
    description: "Làm bài kiểm tra và xem lại kết quả học tập của bạn.",
    icon: PenLine,
    accent: "Bài kiểm tra",
    heading: "Chưa có bài kiểm tra",
    body: "Khi giáo viên tạo bài kiểm tra, bạn sẽ thấy lịch làm bài, thời lượng và kết quả tại đây.",
    action: "Xem bài tập",
    href: "/assignments",
  },
} as const;

export default function StudyHub() {
  const [location] = useLocation();
  const item = content[location as keyof typeof content] || content["/on-thi"];
  const Icon = item.icon;
  return <DashboardLayout eyebrow={item.eyebrow} title={item.title} description={item.description}><div className="mx-auto max-w-7xl"><section className="overflow-hidden rounded-[30px] bg-[#163454] p-7 text-white shadow-xl shadow-[#163454]/10 md:p-10"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a9d7c6]"><Icon size={16} /> {item.accent}</div><h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl">{item.heading}</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/70">{item.body}</p><Link href={item.href}><Button className="mt-7 rounded-xl bg-[#f4c8bd] text-[#163454] hover:bg-[#f7d8d0]">{item.action} <ArrowRight size={16} /></Button></Link></div><div className="relative flex min-h-56 items-center justify-center rounded-[26px] bg-white/10 p-8"><div className="absolute right-8 top-7 h-28 w-28 rounded-full border-[18px] border-[#a9d7c6]/15" /><div className="relative text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4c8bd] text-[#163454]"><Icon size={30} /></div><p className="mt-4 text-sm font-semibold text-white/80">Nội dung đang được chuẩn bị</p><p className="mt-1 text-xs text-white/50">ZEdu sẽ cập nhật sớm</p></div></div></div></section><div className="mt-6 grid gap-4 md:grid-cols-3"><InfoCard icon={<BookOpen size={18} />} title="Học theo chủ đề" text="Ôn lại kiến thức theo từng phần nhỏ, dễ theo dõi." /><InfoCard icon={<CalendarDays size={18} />} title="Theo dõi lịch" text="Không bỏ lỡ lịch ôn tập và thời hạn quan trọng." /><InfoCard icon={<Sparkles size={18} />} title="Tiến bộ mỗi ngày" text="Duy trì nhịp học đều đặn để tự tin hơn." /></div></div></DashboardLayout>;
}
function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-[22px] border border-[#dbe3e0] bg-white p-5"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f1ed] text-[#398266]">{icon}</div><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>; }
