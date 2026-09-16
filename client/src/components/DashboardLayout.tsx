import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { BookOpen, ClipboardCheck, GraduationCap, Home, LogOut, Menu, MessageCircle, ClipboardList, PenLine, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Tổng quan", icon: Home },
  { href: "/lessons", label: "Bài học", icon: BookOpen },
  { href: "/assignments", label: "Bài tập", icon: ClipboardCheck },
  { href: "/on-thi", label: "Ôn thi", icon: ClipboardList },
  { href: "/kiem-tra", label: "Kiểm tra", icon: PenLine },
  { href: "/messages", label: "Tin nhắn", icon: MessageCircle },
];

export default function DashboardLayout({ children, eyebrow, title, description }: { children: ReactNode; eyebrow?: string; title?: string; description?: string }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client || !user?.messageChannel) return;
    const channel = client.channel(`message-events:${user.messageChannel}`).on("broadcast", { event: "message:new" }, async () => {
      await utils.messages.list.invalidate();
      toast.info("Bạn có tin nhắn mới", { description: "Hộp thư đã được cập nhật realtime." });
    }).subscribe();
    return () => { void client.removeChannel(channel); };
  }, [user?.messageChannel, utils]);

  if (loading) return <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center text-[#163454]"><div className="h-10 w-10 rounded-full border-4 border-[#c9d7d7] border-t-[#e87560] animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-6"><div className="max-w-md rounded-[28px] bg-white p-10 text-center shadow-[0_20px_60px_rgba(22,52,84,0.1)]"><img src="/logo.png" alt="Logo ZEdu" className="mx-auto mb-5 h-14 w-14 rounded-2xl object-contain" /><h1 className="font-display text-3xl font-bold text-[#163454]">Đăng nhập để tiếp tục</h1><p className="mt-3 text-sm leading-6 text-slate-500">ZEdu giữ nội dung học tập ở phía sau phiên đăng nhập bảo mật.</p><Button className="mt-7 h-12 w-full rounded-xl bg-[#e87560] text-white hover:bg-[#d96350]" onClick={() => { window.location.href = "/auth"; }}>Đăng nhập ZEdu</Button></div></div>;

  const handleLogout = async () => { await logout(); toast.success("Bạn đã đăng xuất an toàn."); };
  return <div className="min-h-screen bg-[#f7f5f0] text-[#163454]"><div className="mx-auto flex min-h-screen max-w-[1600px]">{open && <button className="fixed inset-0 z-30 bg-[#163454]/30 lg:hidden" aria-label="Đóng menu" onClick={() => setOpen(false)} />}<aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[274px] -translate-x-full flex-col border-r border-[#dbe3e0] bg-[#fbfaf7] px-5 py-6 transition-transform duration-200 lg:static lg:translate-x-0", open && "translate-x-0")}><div className="flex items-center justify-between px-2"><Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" /><span><span className="block font-display text-xl font-bold tracking-tight">ZEdu</span><span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e87560]">Học để tiến bộ</span></span></Link><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={18} /></button></div><div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Không gian học tập</div><nav className="mt-3 space-y-1">{navItems.map(item => { const Icon = item.icon; const active = item.href === "/" ? location === "/" : location.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors", active ? "bg-[#e8f1ed] text-[#163454]" : "text-slate-500 hover:bg-slate-100 hover:text-[#163454]")}><Icon size={18} className={cn(active ? "text-[#e87560]" : "text-slate-400 group-hover:text-[#163454]")} />{item.label}</Link>; })}</nav><div className="mt-auto rounded-2xl bg-[#163454] p-4 text-white"><div className="mb-3 flex items-center gap-2 text-[#a9d7c6]"><GraduationCap size={18} /><span className="text-xs font-bold uppercase tracking-wider">Góc tập trung</span></div><p className="text-sm leading-5 text-white/80">Một bài nhỏ mỗi ngày sẽ tạo nên tiến bộ dài hạn.</p><a href="https://nhut120c-boop.github.io/" target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-[#a9d7c6] underline underline-offset-4 hover:text-white">Về người xây dựng ZEdu</a></div><div className="mt-4 flex items-center gap-3 border-t border-[#dbe3e0] px-2 pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4c8bd] font-bold text-[#163454]">{(user?.name || "Z").charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{user?.name || "Học viên"}</div><div className="truncate text-xs text-slate-400">{user?.email || "Tài khoản đã xác thực"}</div></div><button onClick={handleLogout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#e87560]" aria-label="Đăng xuất"><LogOut size={17} /></button></div></aside><main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#dbe3e0]/80 bg-[#f7f5f0]/90 px-5 py-4 backdrop-blur lg:px-10"><button onClick={() => setOpen(true)} className="rounded-xl bg-white p-2.5 shadow-sm lg:hidden" aria-label="Mở menu"><Menu size={18} /></button><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e87560]">{eyebrow || "Khu vực học tập"}</p>{title && <h1 className="mt-1 truncate font-display text-xl font-bold tracking-tight text-[#163454] md:text-2xl">{title}</h1>}{description && <p className="mt-1 hidden text-sm text-slate-500 md:block">{description}</p>}</div></header><div className="px-5 py-7 lg:px-10 lg:py-10">{children}</div></main></div></div>;
}
