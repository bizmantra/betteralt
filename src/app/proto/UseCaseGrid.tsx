"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "./_ui";
import { USE_CASES, TOPICS, TYPES, ROLES, CT, type UseCase, type ContentType } from "./_usecases";
export const UCCard = ({ u }: { u: UseCase }) => {
  const live = u.status === "live";
  const b = <div className={`flex h-full flex-col rounded-xl border border-rule bg-white p-5 ${live ? "transition hover:border-green hover:shadow-md" : "opacity-70"}`}>
    <p className="text-sm text-ink-2">{u.topic} · {u.contentTypes.map((c) => CT[c].label).join(", ")}</p>
    <h3 className="mt-1 text-xl font-semibold">{u.title}</h3>
    <p className="mt-1 text-ink-2">You get: {u.outcome}</p>
    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-sm">
      {u.contentTypes.includes("free-tool") && <span className="inline-flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 font-medium text-green-dark"><Icon n="check" c="h-4 w-4"/>Free tool included</span>}
      {!live && <span className="rounded-full bg-paper px-3 py-1 text-ink-2">Coming soon</span>}
      <span className="ml-auto text-xs text-ink-2" data-testid="role-chips">{u.roles.map((r) => ROLES.find((x) => x.slug === r)!.plural).join(" · ")}</span>
    </div></div>;
  return live ? <Link href={`/proto/use-cases/${u.slug}`} data-testid="uc-card">{b}</Link> : <div data-testid="uc-card">{b}</div>;
};
const Chip = ({ on, set, label }: { on: boolean; set: () => void; label: string }) =>
  <button type="button" aria-pressed={on} onClick={set} className={`rounded-full border px-4 py-1.5 text-sm ${on ? "border-green bg-green text-white" : "border-rule bg-white"}`}>{label}</button>;
export default function UseCaseGrid() {
  const [q, setQ] = useState(""), [topic, setTopic] = useState(""), [type, setType] = useState(""), [rl, setRl] = useState(""), [ct, setCt] = useState("");
  const sp = useSearchParams(), key = sp.toString();
  useEffect(() => { const p = new URLSearchParams(key); setQ(p.get("q") ?? ""); setRl(p.get("role") ?? ""); setCt(p.get("ct") ?? ""); }, [key]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = USE_CASES.filter((u) => (!topic || u.topic === topic) && (!type || u.jobType === type) && (!rl || u.roles.includes(rl as never)) && (!ct || u.contentTypes.includes(ct as ContentType))
    && words.every((w) => `${u.title} ${u.outcome} ${u.topic}`.toLowerCase().includes(w)));
  const sel = "rounded-lg border border-rule bg-white px-3 py-1.5 text-sm";
  return <div>
    <label htmlFor="ucq" className="sr-only">Search use cases</label>
    <div className="flex items-center gap-3 rounded-xl border border-rule shadow-sm bg-white px-4 py-3 shadow-sm"><Icon n="search" c="h-6 w-6"/>
      <input id="ucq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. email, quiz, contract" className="w-full bg-transparent text-lg outline-none"/></div>
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-sm font-medium">Topic</span><Chip on={!topic} set={() => setTopic("")} label="All"/>{TOPICS.map((t) => <Chip key={t} on={topic === t} set={() => setTopic(topic === t ? "" : t)} label={t}/>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-sm font-medium">Job</span><Chip on={!type} set={() => setType("")} label="All"/>{TYPES.map((t) => <Chip key={t} on={type === t} set={() => setType(type === t ? "" : t)} label={t}/>)}</div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-2">
        <label>Role <select data-testid="f-role" className={sel} value={rl} onChange={(e) => setRl(e.target.value)}><option value="">Any</option>{ROLES.map((r) => <option key={r.slug} value={r.slug}>{r.plural}</option>)}</select></label>
        <label>Format <select data-testid="f-ct" className={sel} value={ct} onChange={(e) => setCt(e.target.value)}><option value="">Any</option>{(Object.keys(CT) as ContentType[]).map((c) => <option key={c} value={c}>{CT[c].plural}</option>)}</select></label>
      </div>
    </div>
    <p className="mt-5 text-sm text-ink-2" role="status" data-testid="count">{list.length} of {USE_CASES.length} use cases</p>
    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((u) => <UCCard key={u.slug} u={u}/>)}</div>
    {!list.length && <p className="mt-6 rounded-xl bg-white p-5">Nothing matches yet. Try a shorter word, or clear the filters.</p>}
  </div>;
}
