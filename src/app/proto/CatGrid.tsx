"use client";
import Link from "next/link";
import { useState } from "react";
type C = { slug: string; h1: string; card: string; intent: string; task: string; href: string };
export default function CatGrid({ items, tasks }: { items: C[]; tasks: string[] }) {
  const [t, setT] = useState("All");
  const shown = items.filter((i) => t === "All" || i.task === t);
  return <div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter by task" data-testid="filters">{["All", ...tasks].map((x) =>
    <button key={x} aria-pressed={t === x} onClick={() => setT(x)} className={`rounded-full border px-4 py-2 text-sm ${t === x ? "border-green bg-green text-white" : "border-rule bg-white"}`}>{x}</button>)}</div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((i) => <Link key={i.slug} href={i.href} data-testid="cat-card" className="flex flex-col rounded-xl border border-rule bg-white p-5 transition hover:border-green hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-green">{i.intent} · {i.task}</p><h3 className="mt-1 text-xl font-semibold">{i.h1}</h3><p className="mt-1 text-ink-2">{i.card}</p>
      <span className="mt-auto pt-4 text-sm font-semibold text-green">Open free {i.intent === "Template" ? "template" : "tool"} →</span></Link>)}</div></div>;
}
