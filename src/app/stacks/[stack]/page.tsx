import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, Price, Tags } from "@/components/ui";
import { stacks, getTool, getPerson } from "@/lib/data";
import { lastmodStack } from "@/lib/seo";
import Byline from "@/components/slots/Byline";
import Cta from "@/components/slots/Cta";
import Monogram from "@/components/Monogram";
import { Newsletter } from "@/components/ui";
import ShareRow from "@/components/ShareRow";
import { buildMetadata, Crumbs, webPageLd } from "@/components/seo";
export const dynamicParams = false;
export const generateStaticParams = () => stacks.map((s) => ({ stack: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ stack: string }> }): Promise<Metadata> {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack)!;
  return buildMetadata({ title: s.title, description: s.intro, path: `/stacks/${stack}`, type: "article" });
}
export default async function Page({ params }: { params: Promise<{ stack: string }> }) {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack); if (!s) notFound();
  return <div className="max-w-3xl space-y-6" data-page-type="stack"><JsonLd data={webPageLd({ path: `/stacks/${s.slug}`, name: s.title, published: s.firstPublished, modified: lastmodStack(s.slug), reviewer: getPerson(s.reviewedBy), type: "Article" })} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: s.title, itemListElement: s.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: getTool(it.tool)!.name, url: `https://findbetteralt.com/tools/${it.tool}` })) }} />
    <Crumbs items={[{ name: "Stacks", href: "/stacks" }, { name: s.title }]} />
    <div><h1 className="font-serif text-3xl font-semibold">{s.title}</h1><Byline reviewedBy={s.reviewedBy} authors={s.authors} updated={lastmodStack(s.slug)} checked={s.items.map((it) => getTool(it.tool)!.pricing.lastChecked)} /><ShareRow className="mt-2" path={`/stacks/${s.slug}`} text={s.title} pageType="stack" slug={s.slug} /></div><p className="text-ink-2">{s.intro}</p>
    <ol className="space-y-3">{s.items.map((it, i) => { const t = getTool(it.tool)!; return <li key={it.tool} className="rounded-xl border bg-white p-4">
      <div className="flex items-baseline justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><Monogram name={t.name} slug={t.slug} size={28} /><Link href={`/tools/${t.slug}`} className="hover:text-indigo-600">{t.name}</Link></h2><span className="text-sm text-slate-500">{it.role}</span></div>
      <p className="my-1 text-sm text-slate-700">{t.description}</p><Tags tags={t.tags} /><div className="mt-2"><Price t={t} /></div><div className="mt-3 sm:max-w-xs"><Cta t={t} anchor={s.slug} placement="stack" position={i + 1} /></div></li>; })}</ol>
    <section id="how-we-picked" className="text-sm text-ink-2"><h2 className="font-serif text-xl font-semibold text-ink">How we check prices</h2><p>Prices are in US dollars from each vendor&apos;s own pricing page, never converted, each with its checked date and source. Research is AI-assisted and reviewed by the team.</p></section>
    <Newsletter source={`stacks/${s.slug}`} placement="end" />
  </div>;
}
