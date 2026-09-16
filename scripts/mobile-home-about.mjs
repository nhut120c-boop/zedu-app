import fs from "node:fs";
const homePath = "client/src/pages/Home.tsx";
let home = fs.readFileSync(homePath, "utf8");
home = home.replace('className="relative overflow-hidden rounded-[28px] bg-[#163454] p-7 text-white shadow-xl shadow-[#163454]/10 md:p-9"', 'className="relative overflow-hidden rounded-[28px] bg-[#163454] p-5 text-white shadow-xl shadow-[#163454]/10 sm:p-7 md:p-9"');
home = home.replace('className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a9d7c6]"><Sparkles size={14} /> Tổng quan học tập', 'className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a9d7c6] sm:flex"><Sparkles size={14} /> Tổng quan học tập');
home = home.replace('className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl"', 'className="mt-1 max-w-xl font-display text-3xl font-bold leading-[1.08] sm:mt-5 sm:text-4xl md:text-5xl"');
home = home.replace('className="mt-5 max-w-lg text-sm leading-7 text-white/65"', 'className="mt-4 max-w-lg text-sm leading-6 text-white/65 sm:mt-5 sm:leading-7"');
home = home.replace('<section id="features" className="relative mx-auto grid max-w-7xl gap-4 px-6 pb-24 md:grid-cols-3 lg:px-10">', '<div className="relative mx-auto mt-8 max-w-7xl px-6 pb-4 text-center lg:px-10"><a href="https://nhut120c-boop.github.io/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#398266] underline decoration-[#b8d9cd] underline-offset-4 hover:text-[#163454]">Tìm hiểu thêm về người xây dựng ZEdu</a></div><section id="features" className="relative mx-auto grid max-w-7xl gap-4 px-6 pb-24 md:grid-cols-3 lg:px-10">');
fs.writeFileSync(homePath, home);

const layoutPath = "client/src/components/DashboardLayout.tsx";
let layout = fs.readFileSync(layoutPath, "utf8");
layout = layout.replace('<p className="text-sm leading-5 text-white/80">Một bài nhỏ mỗi ngày sẽ tạo nên tiến bộ dài hạn.</p></div>', '<p className="text-sm leading-5 text-white/80">Một bài nhỏ mỗi ngày sẽ tạo nên tiến bộ dài hạn.</p><a href="https://nhut120c-boop.github.io/" target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-[#a9d7c6] underline underline-offset-4 hover:text-white">Về người xây dựng ZEdu</a></div>');
fs.writeFileSync(layoutPath, layout);
