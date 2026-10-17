"use client";
import { useState } from "react";
import Link from "next/link";
type Item = { slug: string; name: string; category: string; anchor: boolean };
export default function Search({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const r = q.length < 1 ? [] : items.filter((i) => (i.name + " " + i.category).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return <div className="relative mx-auto w-full max-w-xl">
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a tool, e.g. Cursor, Midjourney, Zapier…" aria-label="Search tools"
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-indigo-500" />
    {r.length > 0 && <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-white text-left shadow-lg">
      {r.map((i) => <li key={i.slug}><Link className="flex justify-between px-4 py-2 hover:bg-slate-50" href={i.anchor ? `/alternatives/${i.slug}` : `/tools/${i.slug}`}>
        <span>{i.anchor ? `Alternatives to ${i.name}` : i.name}</span><span className="text-xs text-slate-500">{i.category}</span></Link></li>)}
    </ul>}
  </div>;
}
