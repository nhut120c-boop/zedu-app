import fs from "node:fs";

const homePath = "client/src/pages/Home.tsx";
let home = fs.readFileSync(homePath, "utf8");
home = home.replace('  const admin = trpc.learning.adminOverview.useQuery(undefined, { enabled: isAuthenticated, retry: false });\n', "");
home = home.replace('Learning dashboard', 'Tổng quan học tập');
home = home.replace('Keep moving.', 'Tiếp tục tiến lên');
const adminSection = /\{admin\.data && <section className="mt-6[\s\S]*?<\/section>\}/;
home = home.replace(adminSection, "");
fs.writeFileSync(homePath, home);

const adminPath = "client/src/pages/Admin.tsx";
let admin = fs.readFileSync(adminPath, "utf8");
admin = admin.replace('import { trpc } from "@/lib/trpc";\n', 'import { trpc } from "@/lib/trpc";\nimport { useAuth } from "@/_core/hooks/useAuth";\n');
admin = admin.replace('  const overview = trpc.learning.adminOverview.useQuery(undefined, { retry: false });', '  const { user, loading, isAuthenticated } = useAuth();\n  const canManage = Boolean(user?.canManage);\n  const overview = trpc.learning.adminOverview.useQuery(undefined, { enabled: isAuthenticated && canManage, retry: false });');
admin = admin.replace('  const utils = trpc.useUtils();', '  const utils = trpc.useUtils();\n  if (loading) return <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c9d7d7] border-t-[#e87560]" /></div>;\n  if (!isAuthenticated) return <div className="min-h-screen bg-[#f7f5f0] p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#163454]">Đăng nhập để tiếp tục</h1><p className="mt-3 text-slate-500">Khu vực này dành cho giáo viên.</p></div>;\n  if (!canManage) return <div className="min-h-screen bg-[#f7f5f0] p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#163454]">Khu vực dành cho giáo viên</h1><p className="mt-3 text-slate-500">Tài khoản của bạn chưa được cấp quyền quản lý lớp học.</p></div>;');
fs.writeFileSync(adminPath, admin);

const boundaryPath = "client/src/components/ErrorBoundary.tsx";
let boundary = fs.readFileSync(boundaryPath, "utf8");
boundary = boundary.replace("An unexpected error occurred.", "Đã xảy ra lỗi không mong muốn.").replace("Reload Page", "Tải lại trang");
fs.writeFileSync(boundaryPath, boundary);

const appPath = "client/src/App.tsx";
let app = fs.readFileSync(appPath, "utf8");
app = app.replace('<Route path="/admin" component={Admin} />', '<Route path="/giao-vien" component={Admin} />\n    <Route path="/admin" component={Admin} />');
fs.writeFileSync(appPath, app);
