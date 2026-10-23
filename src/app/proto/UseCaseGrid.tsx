"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./_ui";
import { USE_CASES, TOPICS, TYPES, type UC } from "./_usecases";
export const UCCard = ({ u }: { u: UC }) => {
  const b = <div className={`flex h-full flex-col rounded-xl border bg-white p-5 ${u.live ? "border-rule hover:border-ink" : "border-rule opacity-70"}`}>
    <p className="text-sm text-ink-2">{u.topic} · {u.type}</p>
    <h3 className="mt-1 text-xl font-semibold">{u.title}</h3>
    <p className="mt-1 text-ink-2">You get: {u.outcome}</p>
    <div className="mt-auto flex flex-wrap gap-2 pt-4 text-sm">
      {u.tool && <span className="inline-flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 font-medium text-green-dark"><Icon n="check" c="h-4 w-4"/>Free tool included</span>}
      {!u.live && <span className="rounded-full bg-paper px-3 py-1 text-ink-2">Coming soon</span>}
    </div></div>;
  return u.live ? <Link href={`/proto/use-cases/${u.slug}`} data-testid="uc-card">{b}</Link> : <div data-testid="uc-card">{b}</div>;
};
const Chip = ({ on, set, label }: { on: boolean; set: () => void; label: string }) =>
  <button type="button" aria-pressed={on} onClick={set} className={`rounded-full border px-4 py-1.5 text-sm ${on ? "border-ink bg-ink text-white" : "border-rule bg-white"}`}>{label}</button>;
export default function UseCaseGrid({ initialQ = "" }: { initialQ?: string }) {
  const [q, setQ] = useState(initialQ), [topic, setTopic] = useState(""), [type, setType] = useState(""), [free, setFree] = useState(false);
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("q"); if (v) setQ(v); }, []);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = USE_CASES.filter((u) => (!topic || u.topic === topic) && (!type || u.type === type) && (!free || u.tool) && words.every((w) => `${u.title} ${u.outcome} ${u.topic}`.toLowerCase().includes(w)));
  return <div>
    <label htmlFor="ucq" className="sr-only">Search use cases</label>
    <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-white px-4 py-3 shadow-[4px_4px_0_#1B1A17]"><Icon n="search" c="h-6 w-6"/>
      <input id="ucq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. email, quiz, contract" className="w-full bg-transparent text-lg outline-none"/></div>
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-sm font-medium">Topic</span><Chip on={!topic} set={() => setTopic("")} label="All"/>{TOPICS.map((t) => <Chip key={t} on={topic === t} set={() => setTopic(topic === t ? "" : t)} label={t}/>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-sm font-medium">Job</span><Chip on={!type} set={() => setType("")} label="All"/>{TYPES.map((t) => <Chip key={t} on={type === t} set={() => setType(type === t ? "" : t)} label={t}/>)}
        <span className="mx-2 h-5 w-px bg-rule"/><Chip on={free} set={() => setFree(!free)} label="Has a free tool"/></div>
    </div>
    <p className="mt-5 text-sm text-ink-2" role="status" data-testid="count">{list.length} of {USE_CASES.length} use cases</p>
    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((u) => <UCCard key={u.slug} u={u}/>)}</div>
    {!list.length && <p className="mt-6 rounded-xl bg-white p-5">Nothing matches yet. Try a shorter word, or clear the filters.</p>}
  </div>;
}
