import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, Crumbs, webPageLd } from "@/components/seo";
import { JsonLd, Newsletter, Price } from "@/components/ui";
import Byline from "@/components/slots/Byline";
import { getTool, fmtDate } from "@/lib/data";
import { groupItems } from "@/lib/picks";
import { teachers as p, lastmodTeachers, type Sourced } from "@/lib/batch1";

export const metadata: Metadata = { ...buildMetadata({ title: p.title, description: p.description, path: p.path, type: "article" }), title: { absolute: p.title } };
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const VENDOR_LABEL = "MagicSchool's own claim (vendor case study, not tested by FindBetterAlt)";
function Src({ s }: { s: Sourced }) { return <a className="text-sm underline" href={s.sourceUrl} target="_blank" rel="nofollow noopener">({host(s.sourceUrl)})</a>; }
export default function Page() {
  const { ranked, unverified } = groupItems(p.tools, getTool);
  const sources = [...new Map([p.problem, ...p.steps.map((s) => s.source), ...p.limits, ...(p.result ? [p.result.claim] : [])].map((s) => [s.sourceUrl, s])).values()];
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "Make a lesson plan with an AI lesson plan generator", step: p.steps.map((s) => ({ "@type": "HowToStep", position: s.n, text: s.action })) };
  return <div className="max-w-3xl space-y-8" data-page-type="persona">
    <JsonLd data={webPageLd({ path: p.path, name: p.h1, published: p.firstPublished, modified: lastmodTeachers(), type: "Article" })} />
    <JsonLd data={howTo} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "AI tools for lesson planning", itemListElement: ranked.map(({ t }, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `https://findbetteralt.com/tools/${t.slug}` })) }} />
    <div>
      <Crumbs items={[{ name: "Teachers" }, { name: "AI lesson plan generator" }]} />
      <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[40px]">{p.h1}</h1>
      <Byline updated={lastmodTeachers()} checked={ranked.map(({ t }) => t.pricing.lastChecked)} />
      <p className="mt-3 text-[17px]">{p.problem.text} <span className="text-sm font-semibold text-amber">{VENDOR_LABEL}:</span> <a className="text-sm underline" href={p.problem.sourceUrl} target="_blank" rel="nofollow noopener">{p.result?.label ?? host(p.problem.sourceUrl)}</a><span className="text-sm text-ink-2">, captured {fmtDate(p.problem.capturedAt)}</span></p>
      <p className="mt-2 text-[17px]">{p.lead}</p>
    </div>
    <section className="grid gap-4 sm:grid-cols-2">
      <div><h2 className="font-serif text-xl font-semibold">Good fit if</h2><ul className="mt-1 list-disc space-y-1 pl-5">{p.goodFit.map((x) => <li key={x}>{x}</li>)}</ul></div>
      <div><h2 className="font-serif text-xl font-semibold">Skip if</h2><ul className="mt-1 list-disc space-y-1 pl-5">{p.skipIf.map((x) => <li key={x}>{x}</li>)}</ul></div>
    </section>
    <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Steps: make a lesson plan with AI</h2>
      <p className="mt-1 text-sm text-ink-2">Based on MagicSchool&apos;s own docs and the Michigan Virtual Khanmigo pilot report.</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5">{p.steps.map((s) => <li key={s.n}><b>{getTool(s.tool)?.name}:</b> {s.action} <Src s={s.source} /></li>)}</ol></section>
    <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">What it costs</h2>
      <p className="mt-1 text-sm text-ink-2">Prices from each vendor&apos;s own pricing page, in US dollars, with the date we checked.</p>
      <ol className="mt-3 space-y-3">{ranked.map(({ it, t }) => <li key={t.slug} className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-semibold"><Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link></h3><span className="text-sm text-ink-2">{it.role}</span></div>
        <div className="mt-1"><Price t={t} /></div></li>)}</ol>
      {unverified.length > 0 && <p className="mt-2 text-sm text-ink-2">Price not yet verified: {unverified.map(({ t }) => t.name).join(", ")}.</p>}
    </section>
    <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Where it breaks</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">{p.limits.map((l) => <li key={l.text}>{l.text} <Src s={l} /></li>)}</ul></section>
    {p.result && <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Reported result (vendor claim)</h2>
      <figure className="mt-2 rounded-lg border-2 border-amber bg-amber-tint p-3" data-vendor-claim="">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-amber">{VENDOR_LABEL}</p>
        <blockquote className="mt-1 border-l-4 border-ink pl-3">&ldquo;{p.result.claim.quote}&rdquo;</blockquote>
        <figcaption className="mt-1 text-sm text-ink-2"><a className="underline" href={p.result.claim.sourceUrl} target="_blank" rel="nofollow noopener">{p.result.label}</a> · captured {fmtDate(p.result.claim.capturedAt)}</figcaption>
      </figure></section>}
    <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Other ways to do this</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">{p.related.map((r) => <li key={r.href}><Link className="underline" href={r.href}>{r.label}</Link></li>)}</ul></section>
    <section className="border-t-2 border-ink pt-3 text-sm"><h2 className="font-serif text-xl font-semibold">Sources</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">{sources.map((s) => <li key={s.sourceUrl}><a className="underline" href={s.sourceUrl} target="_blank" rel="nofollow noopener">{s.sourceUrl}</a> · captured {fmtDate(s.capturedAt)}</li>)}</ul></section>
    <Newsletter source="teachers/ai-lesson-plan-generator" placement="end" />
  </div>;
}
