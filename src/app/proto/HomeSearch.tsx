"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./_ui";
export default function HomeSearch() {
  const [q, setQ] = useState(""); const r = useRouter();
  return <form role="search" className="mx-auto mt-8 max-w-2xl" onSubmit={(e) => { e.preventDefault(); r.push(`/proto/use-cases${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }}>
    <label htmlFor="hs" className="sr-only">What do you need to get done?</label>
    <div className="flex items-center gap-3 rounded-2xl border border-rule shadow-sm bg-white py-2 pl-5 pr-2 shadow-sm"><Icon n="search" c="h-6 w-6"/>
      <input id="hs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. write an email, plan a lesson" className="w-full bg-transparent text-lg outline-none"/>
      <button className="rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">Search</button></div>
    <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">{["email", "lesson", "report card", "contract", "study guide"].map((c) =>
      <button key={c} type="button" onClick={() => r.push(`/proto/use-cases?q=${encodeURIComponent(c)}`)} className="rounded-full border border-rule bg-white px-3 py-1">{c}</button>)}</div>
  </form>;
}
