import Link from "next/link";
import type { ReactNode } from "react";
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const Icon = ({ n, c = "h-7 w-7" }: { n: string; c?: string }) => {
  const d: Record<string, ReactNode> = {
    apple: <><path d="M12 7c-1.5-1-4-1.2-5.5.3C4.6 9.2 5 13 6.5 16c1.2 2.4 3 4 4.5 3.4.6-.2.9-.4 1-.4s.4.2 1 .4c1.5.6 3.3-1 4.5-3.4 1.5-3 1.9-6.8 0-8.7C16 5.8 13.5 6 12 7z" {...P}/><path d="M12 7c0-2 1-3.5 3-4" {...P}/></>,
    shop: <><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-6h6v6" {...P}/></>,
    book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7" {...P}/></>,
    scales: <><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 006 0zM19 7l-3 6a3 3 0 006 0z" {...P}/></>,
    quiz: <><path d="M9 3h6v3H9zM6 5H5v16h14V5h-1M8 11l1.5 1.5L12 10M8 16l1.5 1.5L12 15M14 11h3M14 16h3" {...P}/></>,
    plan: <><path d="M5 4h14v17H5zM8 2v4M16 2v4M8 10h8M8 14h8M8 18h5" {...P}/></>,
    pen: <><path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4" {...P}/></>,
    grid: <><path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16" {...P}/></>,
    mail: <><path d="M3 6h18v12H3zM3 6l9 7 9-7" {...P}/></>,
    lock: <><path d="M6 11h12v9H6zM9 11V8a3 3 0 016 0v3" {...P}/></>,
    warn: <><path d="M12 3l10 18H2zM12 10v5M12 18h0" {...P}/></>,
    check: <><path d="M4 12l5 5L20 6" {...P}/></>,
    search: <><circle cx="11" cy="11" r="7" {...P}/><path d="M21 21l-5-5" {...P}/></>,
    school: <><path d="M3 10l9-6 9 6M5 10v10h14V10M10 20v-5h4v5" {...P}/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden className={c}>{d[n]}</svg>;
};
export const Btn = ({ href, children, ext }: { href: string; children: ReactNode; ext?: boolean }) =>
  ext ? <a href={href} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-2 rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">{children}</a>
      : <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">{children}</Link>;
export const Card = ({ children, c = "" }: { children: ReactNode; c?: string }) => <div className={`rounded-xl border border-rule bg-white p-5 ${c}`}>{children}</div>;
export const Sample = ({ children = "Sample — not yet verified" }: { children?: ReactNode }) => <span className="rounded-md bg-amber-tint px-2 py-0.5 text-xs font-semibold text-amber">{children}</span>;
export const Src = ({ href, date }: { href: string; date: string }) => <span className="text-sm text-ink-2">Checked <span className="font-mono">{date}</span> · <a className="underline" href={href} target="_blank" rel="noopener nofollow">source</a></span>;
export const Watch = ({ extra }: { extra?: ReactNode }) => (
  <section aria-labelledby="watch" className="rounded-xl border border-rule bg-surface-low p-6">
    <h2 id="watch" className="font-serif font-semibold tracking-tight text-2xl">Watch out for</h2>
    <ul className="mt-4 space-y-4">
      <li className="flex gap-3"><Icon n="lock" c="h-6 w-6 shrink-0"/><span><b>Don&apos;t paste student names.</b> Leave out names, ID numbers, grades and anything that could identify a child. Write &quot;Student A&quot; instead. Check your school&apos;s AI rules first.</span></li>
      <li className="flex gap-3"><Icon n="warn" c="h-6 w-6 shrink-0"/><span><b>AI can be wrong.</b> It can make up facts or give a wrong answer key. Read every question and answer before your class sees it. You are responsible for what you hand out.</span></li>
      {extra}
    </ul>
  </section>
);
