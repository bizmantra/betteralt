import Link from "next/link";
import type { Metadata } from "next";
import { tools, changes, getTool, fmtDate } from "@/lib/data";
export const metadata: Metadata = { title: "AI tool price changes", description: "A running log of AI tool price changes, with old price, new price, date and vendor source. Tracking began 17 Oct 2026.", alternates: { canonical: "/changes" } };
export default function Page() {
  const tracked = tools.filter((t) => t.pricing.verified && t.pricing.summary);
  const log = [...changes].sort((a, b) => b.date.localeCompare(a.date));
  return <div className="max-w-3xl space-y-6"><h1 className="text-3xl font-bold">Price changes</h1>
    <p className="text-slate-600">We re-check vendor pricing pages and log every change here, with the old price, the new price and the source. Tracking began on 17 Oct 2026.</p>
    <h2 className="text-xl font-semibold">Changes found</h2>
    {log.length === 0 ? <p className="text-sm text-slate-600">No changes yet.</p> :
    <ul className="divide-y rounded-xl border bg-white">{log.map((c) => { const t = getTool(c.slug); return <li key={c.date + c.slug} className="space-y-1 p-3 text-sm">
      <p><span className="text-slate-500">{fmtDate(c.date)} · </span>{t ? <Link className="font-medium hover:text-indigo-600" href={`/tools/${t.slug}`}>{t.name}</Link> : c.slug}: {c.kind}</p>
      <p className="text-slate-600"><span className="line-through">{c.old}</span> → <span className="font-medium text-slate-800">{c.new}</span> · <a className="underline" href={c.sourceUrl} target="_blank" rel="nofollow noopener">source</a></p></li>; })}</ul>}
    <h2 className="text-xl font-semibold">Prices we track ({tracked.length})</h2>
    <ul className="divide-y rounded-xl border bg-white">{tracked.map((t) => <li key={t.slug} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
      <span><span className="text-slate-500">{fmtDate(t.pricing.lastChecked)} · </span><Link className="font-medium hover:text-indigo-600" href={`/tools/${t.slug}`}>{t.name}</Link></span>
      <span className="text-slate-600">{t.pricing.summary}</span></li>)}</ul></div>;
}
