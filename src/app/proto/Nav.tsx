"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "./_usecases";
import { Icon } from "./_ui";
// Understated menu. Role and compare menus are simple dropdowns driven by the data file.
const COMPARE = [["Alternatives", "/alternatives/chatgpt"], ["Free AI tools", "/free-ai-tools"], ["Open source", "/open-source"], ["Stacks", "/stacks"]];
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
  return <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-[15px]">
    <Link href="/proto" className="mr-auto flex items-center gap-2 text-xl font-bold tracking-tight"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green text-sm text-white">F</span>FindBetterAlt</Link>
    <Link href="/proto/use-cases" className="font-semibold text-green">Use cases</Link>
    <Menu id="m-roles" label="By role" items={roles}/>
    <Link href="/proto/use-cases?ct=free-tool" className="text-ink-2 hover:text-ink">Free tools</Link>
    <Link href="/proto/use-cases?ct=template" className="text-ink-2 hover:text-ink">Templates</Link>
    <Menu id="m-compare" label="Compare AI tools" items={COMPARE as [string, string][]}/>
    <Link href="/changes" className="text-ink-2 hover:text-ink">Price changes</Link>
    <Link href="/proto/use-cases" aria-label="Search use cases" className="text-ink-2 hover:text-ink"><Icon n="search" c="h-5 w-5"/></Link>
  </nav>;
}
