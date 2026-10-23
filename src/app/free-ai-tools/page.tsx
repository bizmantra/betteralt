import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, Crumbs, webPageLd } from "@/components/seo";
import { JsonLd, Newsletter } from "@/components/ui";
import Byline from "@/components/slots/Byline";
import { Faq } from "@/components/slots/Blocks";
import { fmtDate } from "@/lib/data";
import { groupAlts } from "@/lib/picks";
import { monthYear } from "@/lib/seo";
import { freeTools, freeByCategory, lastmodFree, liveAnchor } from "@/lib/batch1";

const PATH = "/free-ai-tools";
const title = () => `Free AI tools that are still free (${monthYear(lastmodFree())}), by category`;
export function generateMetadata(): Metadata {
  return { ...buildMetadata({ title: title(), description: "Every AI tool in our database with a free plan or free version we verified on the vendor's own pricing page, grouped by category, with what the free tier is, the source and the date we checked.", path: PATH }), title: { absolute: title() } };
}
export default function Page() {
  const { ranked } = groupAlts(freeTools()); const cats = freeByCategory();
  const faq = [
    { q: "Which AI tools are completely free?", a: "Tools whose plan line says free and open source have no paid plan in our data. Everything else on this page has a free plan next to paid ones; the plan line under each tool says which." },
    { q: "How do you know these are still free?", a: "Each free plan was checked on the vendor's own pricing page. The date and a link to that page sit next to every tool. Tools we couldn't verify recently are left off this list." },
    { q: "Do free AI tools have limits?", a: "Most free plans cap usage, features or seats. We show the vendor's own plan line; open the source link for the full limits before you rely on a free plan." },
  ];
  return <div className="max-w-4xl space-y-8" data-page-type="listicle">
    <JsonLd data={webPageLd({ path: PATH, name: title(), published: "2026-10-23", modified: lastmodFree(), type: "Article" })} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: title(), numberOfItems: ranked.length, itemListElement: ranked.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `https://findbetteralt.com/tools/${t.slug}` })) }} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    <div>
      <Crumbs items={[{ name: "Free AI tools" }]} />
      <h1 className="mt-1 font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[40px]">Free AI tools that are still free</h1>
      <Byline updated={lastmodFree()} checked={ranked.map((t) => t.pricing.lastChecked)} />
      <p className="mt-3 text-[17px]">{ranked.length} AI tools across {cats.length} categories with a free plan or a free version, each one checked on the vendor&apos;s own pricing page. No tool is listed as free because of a tag or a guess: if we couldn&apos;t confirm the free tier at the source recently, it isn&apos;t here.</p>
      <nav aria-label="Categories on this page" className="mt-3 flex flex-wrap gap-2 text-sm">{cats.map(([c, ts]) => <a key={c} href={`#${slug(c)}`} className="rounded border px-2 py-0.5 hover:bg-white">{c} ({ts.length})</a>)}</nav>
    </div>
    {cats.map(([c, ts]) => { const g = groupAlts(ts).ranked; return <section key={c} id={slug(c)} className="space-y-2">
      <h2 className="border-t-2 border-ink pt-3 font-serif text-2xl font-semibold">{c}: free options</h2>
      {c === "Local AI" && <p className="text-sm"><Link className="underline" href="/categories/local-ai">Compare local and self-hosted AI tools</Link></p>}
      <ul className="divide-y rounded-xl border bg-white">{g.map((t) => <li key={t.slug} className="p-3">
        <p className="font-semibold"><Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link>{t.tags.includes("open source") && <span className="ml-2 text-xs font-normal uppercase text-green">open source</span>}</p>
        <p className="text-[15px] text-ink-2">{t.description}</p>
        <p className="mt-1 font-mono text-[13px]">{t.pricing.summary}</p>
        <p className="text-[13px] text-ink-2">Checked {fmtDate(t.pricing.lastChecked)} · <a className="underline" href={t.pricing.sourceUrl} target="_blank" rel="nofollow noopener" data-track="source_click" data-tool={t.slug} data-region="us">source</a>
          {liveAnchor(t.slug) && <> · <Link className="underline" href={`/alternatives/${t.slug}`}>free {t.name} alternatives</Link></>}</p>
      </li>)}</ul></section>; })}
    <Faq items={faq} />
    <Newsletter source="free-ai-tools" placement="end" />
  </div>;
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
