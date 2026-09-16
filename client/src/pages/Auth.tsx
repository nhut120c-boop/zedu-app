import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startLogin } from "@/const";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Auth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("Hệ thống tài khoản chưa được cấu hình."); return; }
    setBusy(true); setMessage("");
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setMessage("Tài khoản đã tạo. Hãy kiểm tra email để xác nhận rồi đăng nhập."); return; }
    navigate("/");
  };

  return <div className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#163454] md:px-10"><div className="mx-auto max-w-5xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#163454]"><ArrowLeft size={16} /> Về trang chủ</Link><div className="mt-10 grid overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(22,52,84,0.12)] md:grid-cols-[.9fr_1.1fr]"><section className="bg-[#163454] p-8 text-white md:p-12"><div className="flex items-center gap-3"><img src="/logo.png" alt="ZEdu Logo" className="h-11 w-11 rounded-xl object-contain bg-white" /><span className="font-display text-2xl font-bold">ZEdu</span></div><div className="mt-20"><GraduationCap className="text-[#f4c8bd]" size={28} /><h1 className="mt-5 font-display text-4xl font-bold leading-tight">Học tập bắt đầu từ một tài khoản.</h1><p className="mt-5 leading-7 text-white/70">Tạo tài khoản để nhận bài học, nộp bài và trao đổi với giáo viên.</p></div></section><section className="p-8 md:p-12"><div className="flex gap-6 border-b border-[#edf0ed]"><button onClick={() => { setMode("login"); setMessage(""); }} className={`pb-3 text-sm font-bold ${mode === "login" ? "border-b-2 border-[#e87560] text-[#163454]" : "text-slate-400"}`}>Đăng nhập</button><button onClick={() => { setMode("signup"); setMessage(""); }} className={`pb-3 text-sm font-bold ${mode === "signup" ? "border-b-2 border-[#e87560] text-[#163454]" : "text-slate-400"}`}>Tạo tài khoản</button></div><h2 className="mt-8 font-display text-3xl font-bold">{mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</h2><p className="mt-2 text-sm text-slate-500">{mode === "login" ? "Tiếp tục hành trình học tập của bạn." : "Tài khoản mới sẽ bắt đầu với quyền học viên."}</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === "signup" && <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Họ và tên" className="h-12 rounded-xl" />}<Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-12 rounded-xl" /><Input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 6 ký tự)" className="h-12 rounded-xl" />{message && <p className="rounded-xl bg-[#fff3ef] p-3 text-sm leading-5 text-[#b9503e]">{message}</p>}<Button disabled={busy} className="h-12 w-full rounded-xl bg-[#e87560] text-white hover:bg-[#d96350]">{busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</Button></form><div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-[#edf0ed]" /> hoặc <span className="h-px flex-1 bg-[#edf0ed]" /></div><Button type="button" variant="outline" onClick={() => startLogin()} className="h-12 w-full rounded-xl">Đăng nhập bằng Manus</Button></section></div></div></div>;
}
