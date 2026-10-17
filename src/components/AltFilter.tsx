"use client";
import { useState, type ReactNode } from "react";
export default function AltFilter({ keys, children }: { keys: { slug: string; flags: string[]; usd?: number | null }[]; children: ReactNode[] }) {
  const [on, setOn] = useState<string[]>([]);
  const [sort, setSort] = useState(false);
  const F = [["free", "Free"], ["open-source", "Open source"], ["self-hosted", "Self-hosted"], ["cheaper", "Cheaper (USD)"]];
  const show = keys.map((k) => on.every((f) => k.flags.includes(f)));
  // Sort by cheapest paid plan in USD; free/OSS without a USD figure first, unknown prices last
  const rank = (i: number) => { const k = keys[i]; if (k.usd != null) return k.usd; return k.flags.includes("free") ? -1 : Infinity; };
  const order = keys.map((_, i) => i);
  if (sort) order.sort((a, b) => rank(a) - rank(b));
  return <div>
    <div className="mb-4 flex flex-wrap gap-2">{F.map(([k, l]) => <button key={k} onClick={() => setOn(on.includes(k) ? on.filter((x) => x !== k) : [...on, k])}
      className={`rounded-full border px-3 py-1 text-sm ${on.includes(k) ? "border-indigo-600 bg-indigo-600 text-white" : "bg-white hover:bg-slate-50"}`}>{l}</button>)}
      <button onClick={() => setSort(!sort)} className={`rounded-full border px-3 py-1 text-sm ${sort ? "border-indigo-600 bg-indigo-600 text-white" : "bg-white hover:bg-slate-50"}`}>Sort: lowest USD price</button>
      <span className="self-center text-sm text-slate-500">{show.filter(Boolean).length} shown</span></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{order.map((i) => show[i] ? <div key={keys[i].slug}>{children[i]}</div> : null)}</div>
  </div>;
}
