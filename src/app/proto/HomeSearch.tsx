"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "./_ui";
const JOBS = [
  { t: "Make a quiz", href: "/proto/for/teachers/quizzes", k: "quiz test questions assessment" },
  { t: "Plan a lesson", href: "/proto/templates/lesson-plan", k: "lesson plan planning week" },
  { t: "All teacher jobs", href: "/proto/for/teachers", k: "teacher report card rubric worksheet grading" },
];
export default function HomeSearch() {
  const [q, setQ] = useState("");
  const hits = q ? JOBS.filter((j) => (j.t + " " + j.k).toLowerCase().includes(q.toLowerCase())) : [];
  return <div className="mt-8 max-w-2xl">
    <label htmlFor="hs" className="font-semibold">What do you need to get done?</label>
    <div className="mt-2 flex items-center gap-3 rounded-xl border-2 border-ink bg-white px-4 py-3 shadow-[4px_4px_0_#1B1A17]">
      <Icon n="search" c="h-6 w-6"/><input id="hs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. make a quiz, plan a lesson" className="w-full bg-transparent text-lg outline-none"/>
    </div>
    {q && <ul className="mt-2 rounded-xl border border-rule bg-white">{hits.length ? hits.map((h) => <li key={h.href}><Link className="block px-4 py-3 hover:bg-paper" href={h.href}>{h.t} →</Link></li>) : <li className="px-4 py-3 text-ink-2">Nothing yet for that. Try &quot;quiz&quot; or &quot;lesson&quot;.</li>}</ul>}
    <div className="mt-3 flex flex-wrap gap-2 text-sm">{["Make a quiz", "Plan a lesson"].map((c) => <button key={c} onClick={() => setQ(c.split(" ").pop()!)} className="rounded-full border border-rule bg-white px-3 py-1">{c}</button>)}</div>
  </div>;
}
