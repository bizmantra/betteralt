import type { Tool, AnchorAlternative } from "@/lib/data";
import { getTool, getPerson, FILTERS, isFree, isOss, site, type FilterKey } from "@/lib/data";
import type { Verdict, RedditSummary, FaqItem } from "@/lib/content-schema";
import { picks, groupAlts } from "@/lib/picks";
import { JsonLd, itemList, Newsletter } from "@/components/ui";
import { Crumbs, webPageLd } from "@/components/seo";
import Byline from "@/components/slots/Byline";
import { DirectAnswer, VerdictBox, RedditQuote, RedditThreads, HowToChoose } from "@/components/slots/Text";
import { BestForList, ReplacingBox, FilterLinks, NewsletterInline, MethodologyCard, Faq } from "@/components/slots/Blocks";
import AltCard from "@/components/slots/AltCard";
import SortControl from "@/components/SortControl";
import { Fragment } from "react";

// Starting-price sort rank among RANKED (verified) tools: USD-priced ascending → free/usage/non-USD.
function rank(t: Tool) {
  const usd = (t.pricing.currency ?? "USD") === "USD" ? t.pricing.fromUsdMonthly : null;
  return usd != null && usd > 0 ? Math.round(usd * 100) : 2e6;
}
export type AltPage = {
  pageType: "alternatives" | "variant" | "saas"; path: string; slug: string; anchorTool?: Tool; subjectName: string;
  h1: string; crumbs: { name: string; href?: string }[]; items: Tool[]; meta?: Record<string, AnchorAlternative>;
  summary?: string; verdict?: Verdict; redditSummary?: RedditSummary; howToChoose?: string[]; faq?: FaqItem[];
  reviewedBy?: string; authors?: string[]; updated: string; published?: string;
  filterKeys: FilterKey[]; activeFilter?: FilterKey; parentCount?: number; extra?: Record<string, { replaces?: string; cantDo?: string }>; keepVsSwitch?: string;
};
export default function AltTemplate(p: AltPage) {
  const { items, anchorTool: t } = p;
  const pk = picks(items, p.verdict, getTool, t);
  const { ranked, unverified, gone } = groupAlts(items);
  const reviewer = getPerson(p.reviewedBy);
  const free = items.filter((a) => a.pricing.verified && isFree(a)).map((a) => a.name), oss = items.filter((a) => a.pricing.verified && isOss(a)).map((a) => a.name);
  const approved = (p.faq ?? []).filter((f) => f.q && f.a) as { q: string; a: string }[];
  const generated = [
    { q: `What are the alternatives to ${p.subjectName}?`, a: `This page lists ${items.length}: ${items.map((a) => a.name).join(", ")}.` },
    ...(free.length ? [{ q: `Is there a free alternative to ${p.subjectName}?`, a: `Yes. ${free.join(", ")} ${free.length > 1 ? "offer" : "offers"} a free plan or free version.` }] : []),
    ...(oss.length ? [{ q: `Is there an open-source alternative to ${p.subjectName}?`, a: `Yes: ${oss.join(", ")}.` }] : []),
  ];
  const checked = [...items, ...(t ? [t] : [])].map((x) => x.pricing.lastChecked);
  const variantLinks = (p.pageType === "alternatives" ? p.filterKeys.filter((f) => f === "free" || f === "open-source") : []);
  return <div className="space-y-8" data-page-type={p.pageType}>
    <JsonLd data={webPageLd({ path: p.path, name: p.h1, published: p.published, modified: p.updated, reviewer })} />
    <JsonLd data={itemList(p.h1, ranked)} />
    {approved.length > 0 && <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: approved.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />}
    <div className={t ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]" : ""}>
      <div>
        <Crumbs items={p.crumbs} />
        <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[40px]">{p.h1}</h1>
        <Byline reviewedBy={p.reviewedBy} authors={p.authors} updated={p.updated} checked={checked} />
        <DirectAnswer text={p.summary} />
        <VerdictBox v={p.verdict} />
        <RedditQuote r={p.redditSummary} />
        <BestForList items={pk} anchor={p.slug} />
      </div>
      {t && <ReplacingBox t={t} />}
    </div>
    {/* Builder path card: hidden until /stacks/indie-builder ships (spec P0-3 #9) */}
    <section aria-labelledby="alts-h" className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-3 border-t-2 border-ink pt-3"><h2 id="alts-h" className="font-serif text-2xl font-semibold">The alternatives</h2></div>
      <FilterLinks tool={p.slug} n={p.parentCount ?? items.length} active={p.activeFilter} keys={p.filterKeys} />
      <SortControl listId="alt-list" count={ranked.length} />
      <ol id="alt-list" className="flex flex-col gap-4">
        {ranked.map((a, i) => <Fragment key={a.slug}>
          <li data-sort-rank={rank(a) * 100 + i}><AltCard t={a} meta={p.meta?.[a.slug]} anchor={p.slug} anchorName={p.subjectName} position={i + 1} extra={p.extra?.[a.slug]} /></li>
          {i === 3 && ranked.length >= 6 && <li data-inline-after={4} className="list-none"><NewsletterInline tool={p.subjectName} source={`${p.pageType}/${p.slug}`} /></li>}
        </Fragment>)}
      </ol>
    </section>
    {unverified.length > 0 && <section aria-labelledby="unv-h" className="space-y-3" data-group="unverified">
      <h2 id="unv-h" className="font-serif text-xl font-semibold">Price not yet verified</h2>
      <p className="max-w-3xl text-sm text-ink-2">We couldn&apos;t confirm these prices on the vendor&apos;s own page in the last {site.staleAfterDays ?? 14} days, so they aren&apos;t ranked, badged or picked. Check the vendor page before you buy.</p>
      <ul className="flex flex-col gap-4">{unverified.map((a) => <li key={a.slug}><AltCard t={a} meta={p.meta?.[a.slug]} anchor={p.slug} anchorName={p.subjectName} position={0} extra={p.extra?.[a.slug]} /></li>)}</ul>
    </section>}
    {gone.length > 0 && <section aria-labelledby="gone-h" className="space-y-3" data-group="gone">
      <h2 id="gone-h" className="font-serif text-xl font-semibold">Acquired or shut down</h2>
      <ul className="flex flex-col gap-4">{gone.map((a) => <li key={a.slug}><AltCard t={a} meta={p.meta?.[a.slug]} anchor={p.slug} anchorName={p.subjectName} position={0} extra={p.extra?.[a.slug]} /></li>)}</ul>
    </section>}
    {p.keepVsSwitch && <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Keep {p.subjectName} with an AI add-on, or switch?</h2><p className="mt-2 max-w-3xl">{p.keepVsSwitch}</p></section>}
    {variantLinks.length > 0 && <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">Free &amp; open-source picks</h2>
      <ul className="mt-2 list-disc pl-5">{variantLinks.map((f) => <li key={f}><a className="underline" href={`/alternatives/${p.slug}/${f}`}>{FILTERS[f].title} to {p.subjectName}</a></li>)}</ul></section>}
    <HowToChoose items={p.howToChoose} />
    <MethodologyCard reviewedBy={p.reviewedBy} />
    <RedditThreads r={p.redditSummary} />
    <Faq items={approved.length ? approved : generated} />
    <Newsletter source={`${p.pageType}/${p.slug}`} placement="end" />
  </div>;
}
