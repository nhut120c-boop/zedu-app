import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CheckCheck, MessageCircle, Search, Send, Smile, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const messages = trpc.messages.list.useQuery();
  const recipients = trpc.messages.recipients.useQuery();
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const people = useMemo(() => {
    const map = new Map<number, { id: number; label: string; last: Date | null; preview: string }>();
    for (const person of recipients.data || []) map.set(person.id, { id: person.id, label: person.label, last: null, preview: "Bắt đầu cuộc trò chuyện" });
    for (const message of messages.data || []) {
      const otherId = message.senderId === user?.id ? message.recipientId : message.senderId;
      const otherName = message.senderId === user?.id ? message.recipientName : message.senderName;
      const current = map.get(otherId) || { id: otherId, label: otherName || "Thành viên", last: null, preview: "" };
      if (!current.last || new Date(message.createdAt) > current.last) { current.last = new Date(message.createdAt); current.preview = message.body; }
      map.set(otherId, current);
    }
    return Array.from(map.values()).filter(item => item.label.toLowerCase().includes(search.toLowerCase())).sort((a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0));
  }, [messages.data, recipients.data, search, user?.id]);

  useEffect(() => { if (!selectedId && people[0]) setSelectedId(people[0].id); }, [people, selectedId]);
  const activePerson = people.find(person => person.id === selectedId);
  const conversation = (messages.data || []).filter(message => message.senderId === selectedId || message.recipientId === selectedId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation.length, selectedId]);

  const send = trpc.messages.send.useMutation({ onSuccess: async () => { setBody(""); await utils.messages.list.invalidate(); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, onError: error => toast.error(error.message) });
  const submit = () => { if (selectedId && body.trim()) send.mutate({ recipientId: selectedId, body: body.trim() }); };

  return <DashboardLayout eyebrow="Tin nhắn" title="Tin nhắn" description="Trao đổi nhanh chóng với giáo viên và học viên."><div className="mx-auto max-w-7xl"><div className="flex h-[min(720px,calc(100vh-190px))] min-h-[560px] overflow-hidden rounded-[26px] border border-[#dbe3e0] bg-white shadow-[0_18px_55px_rgba(22,52,84,0.08)]"><aside className={`${selectedId ? "hidden md:flex" : "flex"} w-full flex-col border-r border-[#edf0ed] bg-[#fbfaf7] md:w-[320px]`}><div className="border-b border-[#edf0ed] p-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Trò chuyện</h2><p className="mt-1 text-xs text-slate-400">{people.length} cuộc trò chuyện</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f1ed] text-[#398266]"><MessageCircle size={19} /></div></div><div className="relative mt-5"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm" className="h-10 w-full rounded-xl border border-[#dbe3e0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#8fc4b0]" /></div></div><div className="flex-1 overflow-y-auto p-2">{people.map(person => <button key={person.id} onClick={() => setSelectedId(person.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${selectedId === person.id ? "bg-[#e8f1ed]" : "hover:bg-[#f3f4f1]"}`}><div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4c8bd] font-bold text-[#163454]">{person.label.charAt(0).toUpperCase()}<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#55a585]" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-[#163454]">{person.label}</div><div className="mt-1 truncate text-xs text-slate-400">{person.preview}</div></div>{person.last && <span className="self-start pt-1 text-[10px] text-slate-400">{person.last.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>}</button>)}{!people.length && <div className="p-8 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện</div>}</div></aside><section className={`${selectedId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-white`}>{activePerson ? <><header className="flex items-center gap-3 border-b border-[#edf0ed] px-5 py-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4c8bd] font-bold text-[#163454]">{activePerson.label.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold">{activePerson.label}</h2><p className="mt-0.5 text-xs text-[#55a585]">Đang trao đổi</p></div><CheckCheck size={18} className="text-[#8fc4b0]" /></header><div className="flex-1 overflow-y-auto bg-[#f8faf8] px-4 py-6 md:px-8"><div className="mb-6 text-center text-[11px] text-slate-400">Hôm nay</div>{conversation.map(message => { const mine = message.senderId === user?.id; return <div key={message.id} className={`mb-4 flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] md:max-w-[65%] ${mine ? "items-end" : "items-start"} flex flex-col`}><div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${mine ? "rounded-br-md bg-[#163454] text-white" : "rounded-bl-md border border-[#edf0ed] bg-white text-[#163454]"}`}>{message.body}</div><span className="mt-1 px-1 text-[10px] text-slate-400">{new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></div></div>})}{!conversation.length && <div className="flex h-full items-center justify-center text-center"><div><MessageCircle className="mx-auto mb-3 text-[#b8d9cd]" size={36} /><p className="text-sm font-semibold text-slate-500">Hãy bắt đầu cuộc trò chuyện</p><p className="mt-1 text-xs text-slate-400">Gửi lời chào đầu tiên cho {activePerson.label}.</p></div></div>}<div ref={bottomRef} /></div><div className="border-t border-[#edf0ed] bg-white p-3 md:p-4"><div className="flex items-end gap-2 rounded-2xl bg-[#f7f5f0] p-2"><button className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-[#398266] sm:flex" aria-label="Biểu tượng cảm xúc"><Smile size={19} /></button><Textarea value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Nhập tin nhắn..." className="min-h-10 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0" rows={1} /><Button disabled={!body.trim() || send.isPending} onClick={submit} className="h-10 w-10 shrink-0 rounded-xl bg-[#e87560] p-0 text-white hover:bg-[#d96350]" aria-label="Gửi tin nhắn"><Send size={17} /></Button></div><p className="mt-2 px-2 text-[10px] text-slate-400">Nhấn Enter để gửi · Shift + Enter để xuống dòng</p></div></> : <div className="flex flex-1 items-center justify-center p-8 text-center"><div><UserRound className="mx-auto mb-3 text-[#b8d9cd]" size={38} /><h2 className="font-display text-xl font-bold">Chọn một cuộc trò chuyện</h2><p className="mt-2 text-sm text-slate-400">Chọn người nhận để bắt đầu nhắn tin.</p></div></div>}</section></div></div></DashboardLayout>;
}
