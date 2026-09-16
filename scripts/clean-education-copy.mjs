import fs from "node:fs";

const homePath = "client/src/pages/Home.tsx";
let home = fs.readFileSync(homePath, "utf8");
home = home.replace("import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, LockKeyhole, MessageCircle, Shield, Sparkles } from \"lucide-react\";", "import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, MessageCircle, Sparkles } from \"lucide-react\";");
home = home.replace("<div className=\"mt-10 flex items-center gap-3 text-sm text-slate-500\"><LockKeyhole size={16} className=\"text-[#55a585]\" /> Phiên đăng nhập HTTP-only, quyền được kiểm tra ở server</div>", "");
home = home.replace("<div className=\"flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e87560]\"><ShieldIcon /> Khu vực quản trị</div><h3 className=\"mt-2 font-display text-xl font-bold\">Quản lý nội dung và xem bài nộp</h3><p className=\"mt-1 text-sm text-slate-500\">Chỉ tài khoản có quyền server-side mới truy cập được khu vực này.</p>", "<div className=\"text-xs font-bold uppercase tracking-[0.16em] text-[#e87560]\">Dành cho giáo viên</div><h3 className=\"mt-2 font-display text-xl font-bold\">Quản lý lớp học và bài nộp</h3><p className=\"mt-1 text-sm text-slate-500\">Tạo bài học, giao bài tập, chấm điểm và gửi nhận xét cho học viên.</p>");
home = home.replace("Mở admin", "Mở quản lý");
home = home.replace("\nfunction ShieldIcon() { return <LockKeyhole size={14} />; }", "");
fs.writeFileSync(homePath, home);

const adminPath = "client/src/pages/Admin.tsx";
let admin = fs.readFileSync(adminPath, "utf8");
admin = admin.replace("import { ClipboardCheck, FilePlus2, LockKeyhole, Plus, Send, Users } from \"lucide-react\";", "import { ClipboardCheck, FilePlus2, Plus, Send, Users } from \"lucide-react\";");
admin = admin.replace("eyebrow=\"Không gian quản trị\" title=\"Admin control room\" description=\"Tạo nội dung, chấm điểm và gửi phản hồi — mọi quyền đều được kiểm tra ở server.\"", "eyebrow=\"Dành cho giáo viên\" title=\"Quản lý lớp học\" description=\"Tạo bài học, giao bài tập, chấm điểm và gửi nhận xét cho học viên.\"");
admin = admin.replace("<div className=\"mb-7 flex items-start gap-3 rounded-[24px] border border-[#ead5cf] bg-[#fff8f5] p-5\"><div className=\"rounded-xl bg-[#f8ddd6] p-3 text-[#e87560]\"><LockKeyhole size={19} /></div><div><div className=\"font-bold text-[#163454]\">Khu vực giới hạn</div><p className=\"mt-1 text-sm leading-6 text-slate-500\">Nếu tài khoản không có quyền admin, API trả về FORBIDDEN. Frontend không tự quyết định quyền truy cập.</p></div></div>", "");
admin = admin.replace("<span className=\"rounded-full bg-[#e8f1ed] px-3 py-1 text-xs font-bold text-[#398266]\">Admin only</span>", "<span className=\"rounded-full bg-[#e8f1ed] px-3 py-1 text-xs font-bold text-[#398266]\">Giáo viên</span>");
fs.writeFileSync(adminPath, admin);
