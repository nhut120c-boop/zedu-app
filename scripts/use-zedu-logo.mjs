import fs from "node:fs";
const logo = "/manus-storage/zedu-logo-mark_cbde869a.png";
for (const path of ["client/src/pages/Home.tsx", "client/src/components/DashboardLayout.tsx", "client/src/pages/Auth.tsx"]) {
  let text = fs.readFileSync(path, "utf8");
  text = text.replaceAll('<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163454] text-lg font-black text-white">Z</div>', `<img src="${logo}" alt="Logo ZEdu" className="h-10 w-10 rounded-xl object-contain" />`);
  text = text.replaceAll('<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#163454] text-xl font-black text-white">Z</div>', `<img src="${logo}" alt="Logo ZEdu" className="mx-auto mb-5 h-14 w-14 rounded-2xl object-contain" />`);
  text = text.replaceAll('<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163454] text-lg font-black text-white">Z</div>', `<img src="${logo}" alt="Logo ZEdu" className="h-10 w-10 rounded-xl object-contain" />`);
  fs.writeFileSync(path, text);
}
const htmlPath = "client/index.html";
let html = fs.readFileSync(htmlPath, "utf8");
if (!html.includes("zedu-logo-mark")) html = html.replace("<title>ZEdu</title>", `<link rel="icon" type="image/png" href="${logo}" />\n    <title>ZEdu</title>`);
fs.writeFileSync(htmlPath, html);
