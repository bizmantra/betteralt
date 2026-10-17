"use client";
import { useState, type ReactNode } from "react";
export default function AltFilter({ keys, children }: { keys: { slug: string; flags: string[] }[]; children: ReactNode[] }) {
  const [on, setOn] = useState<string[]>([]);
  const F = [["free", "Free"], ["open-source", "Open source"], ["self-hosted", "Self-hosted"], ["cheaper", "Cheaper"]];
  const show = keys.map((k) => on.every((f) => k.flags.includes(f)));
  return <div>
    <div className="mb-4 flex flex-wrap gap-2">{F.map(([k, l]) => <button key={k} onClick={() => setOn(on.includes(k) ? on.filter((x) => x !== k) : [...on, k])}
      className={`rounded-full border px-3 py-1 text-sm ${on.includes(k) ? "border-indigo-600 bg-indigo-600 text-white" : "bg-white hover:bg-slate-50"}`}>{l}</button>)}
      <span className="self-center text-sm text-slate-500">{show.filter(Boolean).length} shown</span></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children.map((c, i) => show[i] ? <div key={i}>{c}</div> : null)}</div>
  </div>;
}
