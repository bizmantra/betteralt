import { buildMetadata, Crumbs } from "@/components/seo";
import Link from "next/link";
import type { Metadata } from "next";
import { tools, vendorChanges, corrections, getTool, fmtDate, site, newToolBatches } from "@/lib/data";
import { lastmodChanges } from "@/lib/seo";
import ShareRow from "@/components/ShareRow";
import { Newsletter } from "@/components/ui";
const changeId = (c: { id?: string; date: string; slug: string }) => c.id ?? `${c.date}-${c.slug}`;
export const metadata: Metadata = { ...buildMetadata({ title: "AI tool price changes", description: `A running log of AI tool price changes, with old price, new price, date and vendor source. Tracking began ${fmtDate(site.priceTrackingStartedAt ?? "2026-10-17")}.`, path: "/changes", ogImage: "/changes/opengraph-image" }),
  alternates: { canonical: "/changes", types: { "application/rss+xml": "/changes/rss.xml" } } };
const MONTH = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
export default function Page() {
  const tracked = tools.filter((t) => t.pricing.verified && t.pricing.summary);
  const log = [...vendorChanges].sort((a, b) => b.date.localeCompare(a.date));
  const fixes = [...corrections].sort((a, b) => b.date.localeCompare(a.date));
  const months = [...new Set(log.map((c) => c.date.slice(0, 7)))];
  return <div className="max-w-3xl space-y-6" data-page-type="changes"><Crumbs items={[{ name: "Price changes" }]} /><h1 className="font-serif text-3xl font-semibold">Price changes</h1>
    <p className="text-ink-2">We re-check vendor pricing pages and log every change here, with the old price, the new price and the source. Tracking began on {fmtDate(site.priceTrackingStartedAt ?? "2026-10-17")}. Last change logged {fmtDate(lastmodChanges())}. <a href="/changes/rss.xml" className="underline">RSS feed</a></p>
    {log.length === 0 && <p className="rounded-xl border-[1.5px] border-ink bg-white p-3 text-sm">No vendor price changes logged yet. A change is only logged when two of our stored snapshots of the vendor&apos;s pricing page (before and after) show different prices.</p>}
    {months.map((m) => <section key={m}><h2 className="font-serif text-xl font-semibold">{MONTH(m + "-01")}</h2>
      <ul className="mt-2 divide-y rounded-xl border-[1.5px] border-ink bg-white">{log.filter((c) => c.date.startsWith(m)).map((c) => { const t = getTool(c.slug), id = changeId(c); return <li key={id} id={id} className="scroll-mt-4 space-y-1 p-3 text-sm">
        <p className="font-semibold">{t ? <Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link> : c.slug}{c.plan ? ` · ${c.plan}` : ""}{c.region === "IN" ? " (India)" : c.region === "US" ? " (US)" : ""}: {c.kind}</p>
        <p className="font-mono text-[13px]">{c.old} → <span className="font-semibold">{c.new}</span></p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-2"><span>{fmtDate(c.date)} · <a className="underline" href={c.sourceUrl} target="_blank" rel="nofollow noopener">source</a> · <a className="underline" href={`#${id}`}>permalink</a></span>
          <ShareRow path={`/changes#${id}`} text={`${t?.name ?? c.slug} price change: ${c.old} → ${c.new}`} pageType="changes" slug={id} /></div></li>; })}</ul></section>)}
    {newToolBatches.length > 0 && <section aria-labelledby="new-h"><h2 id="new-h" className="font-serif text-xl font-semibold">New tools added</h2>
      <p className="mt-1 text-sm text-ink-2">Tools we added to the catalogue after launch. These are additions to our data, not vendor price changes.</p>
      <ul className="mt-2 divide-y rounded-xl border-[1.5px] border-ink bg-white">{newToolBatches.map((b) => <li key={b.id} id={b.id} className="scroll-mt-4 space-y-1 p-3 text-sm">
        <p className="font-semibold">{fmtDate(b.date)}: {b.tools.length} new {b.tools.length === 1 ? "tool" : "tools"}</p>
        <p>{b.tools.map((t, i) => <span key={t.slug}>{i > 0 && ", "}<Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link></span>)}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-2"><a className="underline" href={`#${b.id}`}>permalink</a>
          <ShareRow path={`/changes#${b.id}`} text={`${b.tools.length} new AI tools added ${fmtDate(b.date)}`} pageType="changes" slug={b.id} /></div></li>)}</ul></section>}
    {fixes.length > 0 && <section aria-labelledby="corr-h"><h2 id="corr-h" className="font-serif text-xl font-semibold">Corrections to our data</h2>
      <p className="mt-1 text-sm text-ink-2">These are fixes to prices we had stored wrongly. They are not vendor price changes.</p>
      <ul className="mt-2 divide-y rounded-xl border-[1.5px] border-ink bg-white">{fixes.map((c) => { const t = getTool(c.slug), id = changeId(c); return <li key={id} id={id} className="scroll-mt-4 space-y-1 p-3 text-sm">
        <p className="font-semibold"><span className="mr-1 rounded bg-rust-tint px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-rust">Correction</span>{t ? <Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link> : c.slug}{c.plan ? ` · ${c.plan}` : ""}{c.region === "IN" ? " (India)" : ""}</p>
        <p className="font-mono text-[13px]">We showed {c.old}; the vendor page shows <span className="font-semibold">{c.new}</span></p>
        {c.evidence?.note && <p className="text-[13px] text-ink-2">{c.evidence.note}</p>}
        <p className="text-[13px] text-ink-2">{fmtDate(c.date)} · <a className="underline" href={c.sourceUrl} target="_blank" rel="nofollow noopener">source</a> · <a className="underline" href={`#${id}`}>permalink</a></p></li>; })}</ul></section>}
    <h2 className="font-serif text-xl font-semibold">Prices we track ({tracked.length})</h2>
    <ul className="divide-y rounded-xl border bg-white">{tracked.map((t) => <li key={t.slug} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
      <span><span className="text-ink-2">{fmtDate(t.pricing.lastChecked)} · </span><Link className="font-medium underline" href={`/tools/${t.slug}`}>{t.name}</Link></span>
      <span className="text-ink-2">{t.pricing.summary}</span></li>)}</ul>
    <Newsletter source="changes" placement="end" /></div>;
}
