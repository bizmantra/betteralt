"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "./_usecases";
import { Icon } from "./_ui";
// Understated menu. Desktop: inline links + dropdowns. Mobile (<lg): a single menu button opens a panel, so the nav never wraps.
const COMPARE: [string, string][] = [["Alternatives", "/alternatives/chatgpt"], ["Free AI tools", "/free-ai-tools"], ["Open source", "/open-source"], ["Stacks", "/stacks"]];
const JOBS: [string, string][] = [["Classroom", "/proto/classroom"], ["Running a business", "/proto/running-a-business"]];
function Menu({ label, items, id }: { label: string; items: [string, string][]; id: string }) {
  const [open, setOpen] = useState(false), ref = useRef<HTMLDivElement>(null), path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("click", f); return () => document.removeEventListener("click", f); }, []);
  return <div ref={ref} className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="text-ink-2 hover:text-ink">{label} ▾</button>
    {open && <ul id={id} className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-rule bg-white p-2 shadow-lg">{items.map(([l, h]) =>
      <li key={h}><Link href={h} className="block rounded-lg px-3 py-2 hover:bg-paper">{l}</Link></li>)}</ul>}
  </div>;
}
export default function Nav() {
  const roles = ROLES.filter((r) => r.inMenu).map((r) => [r.plural, `/proto/roles/${r.slug}`] as [string, string]);
  const [mob, setMob] = useState(false), path = usePathname();
  useEffect(() => setMob(false), [path]);
  const Sec = ({ t, items }: { t: string; items: [string, string][] }) => <div><p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-ink-2">{t}</p>{items.map(([l, h]) => <Link key={h} href={h} className="block rounded-lg px-3 py-2.5 text-base hover:bg-paper">{l}</Link>)}</div>;
  return <nav aria-label="Main" className="mx-auto max-w-6xl px-5 py-3 text-[15px]">
    <div className="flex items-center gap-x-6">
      <Link href="/proto" className="mr-auto flex items-center gap-2 text-xl font-bold tracking-tight"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green text-sm text-white">F</span>FindBetterAlt</Link>
      <div className="hidden items-center gap-x-6 lg:flex" data-testid="desktop-nav">
        <Menu id="m-jobs" label="Free tools" items={JOBS}/>
        <Link href="/proto/use-cases" className="text-ink-2 hover:text-ink">Use cases</Link>
        <Menu id="m-roles" label="By role" items={roles}/>
        <Menu id="m-compare" label="Compare AI tools" items={COMPARE}/>
        <Link href="/changes" className="text-ink-2 hover:text-ink">Price changes</Link>
        <Link href="/proto/use-cases" aria-label="Search use cases" className="text-ink-2 hover:text-ink"><Icon n="search" c="h-5 w-5"/></Link>
      </div>
      <button type="button" data-testid="menu-btn" className="flex h-10 w-10 items-center justify-center rounded-lg border border-rule lg:hidden" aria-expanded={mob} aria-controls="mobile-nav" aria-label={mob ? "Close menu" : "Open menu"} onClick={() => setMob(!mob)}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>{mob ? <path d="M6 6l12 12M18 6L6 18"/> : <path d="M4 7h16M4 12h16M4 17h16"/>}</svg></button>
    </div>
    {mob && <div id="mobile-nav" data-testid="mobile-nav" className="mt-3 max-h-[75vh] overflow-y-auto rounded-xl border border-rule bg-white p-2 shadow-lg lg:hidden">
      <Sec t="Free tools" items={JOBS}/><Sec t="Browse" items={[["All use cases", "/proto/use-cases"], ["Price changes", "/changes"]]}/><Sec t="By role" items={roles}/><Sec t="Compare AI tools" items={COMPARE}/></div>}
  </nav>;
}
