import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, Price, Tags } from "@/components/ui";
import { stacks, getTool, getPerson, site, type Tool } from "@/lib/data";
import { lastmodStack } from "@/lib/seo";
import Byline from "@/components/slots/Byline";
import Cta from "@/components/slots/Cta";
import Monogram from "@/components/Monogram";
import { Newsletter } from "@/components/ui";
import ShareRow from "@/components/ShareRow";
import { buildMetadata, Crumbs, webPageLd } from "@/components/seo";
import { groupItems } from "@/lib/picks";
export const dynamicParams = false;
export const generateStaticParams = () => stacks.map((s) => ({ stack: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ stack: string }> }): Promise<Metadata> {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack)!;
  return buildMetadata({ title: s.title, description: s.intro, path: `/stacks/${stack}`, type: "article" });
}
export default async function Page({ params }: { params: Promise<{ stack: string }> }) {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack); if (!s) notFound();
  // Only verified tools are ranked; unverified ones are listed unranked below (same rule as the alternatives pages).
  const { ranked, unverified, gone } = groupItems(s.items, getTool);
  return <div className="max-w-3xl space-y-6" data-page-type="stack"><JsonLd data={webPageLd({ path: `/stacks/${s.slug}`, name: s.title, published: s.firstPublished, modified: lastmodStack(s.slug), reviewer: getPerson(s.reviewedBy), type: "Article" })} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: s.title, itemListElement: ranked.map(({ t }, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `https://findbetteralt.com/tools/${t.slug}` })) }} />
    <Crumbs items={[{ name: "Stacks", href: "/stacks" }, { name: s.title }]} />
    <div><h1 className="font-serif text-3xl font-semibold">{s.title}</h1><Byline reviewedBy={s.reviewedBy} authors={s.authors} updated={lastmodStack(s.slug)} checked={s.items.map((it) => getTool(it.tool)!.pricing.lastChecked)} /><ShareRow className="mt-2" path={`/stacks/${s.slug}`} text={s.title} pageType="stack" slug={s.slug} /></div><p className="text-ink-2">{s.intro}</p>
    <ol className="space-y-3" data-group="ranked">{ranked.map(({ it, t }, i) => <StackCard key={it.tool} t={t} role={it.role} stack={s.slug} position={i + 1} />)}</ol>
    {unverified.length > 0 && <section aria-labelledby="unv-h" className="space-y-3" data-group="unverified">
      <h2 id="unv-h" className="font-serif text-xl font-semibold">Also worth a look (price not yet verified)</h2>
      <p className="text-sm text-ink-2">We couldn&apos;t confirm these prices on the vendor&apos;s own page in the last {site.staleAfterDays ?? 14} days, so they aren&apos;t ranked. Check the vendor page before you buy.</p>
      <ul className="space-y-3">{unverified.map(({ it, t }) => <StackCard key={it.tool} t={t} role={it.role} stack={s.slug} position={0} />)}</ul>
    </section>}
    {gone.length > 0 && <section aria-labelledby="gone-h" className="space-y-3" data-group="gone">
      <h2 id="gone-h" className="font-serif text-xl font-semibold">Acquired or shut down</h2>
      <ul className="space-y-3">{gone.map(({ it, t }) => <StackCard key={it.tool} t={t} role={it.role} stack={s.slug} position={0} />)}</ul>
    </section>}
    <section id="how-we-picked" className="text-sm text-ink-2"><h2 className="font-serif text-xl font-semibold text-ink">How we check prices</h2><p>Prices are in US dollars from each vendor&apos;s own pricing page, never converted, each with its checked date and source. Research is AI-assisted and reviewed by the team.</p></section>
    <Newsletter source={`stacks/${s.slug}`} placement="end" />
  </div>;
}
function StackCard({ t, role, stack, position }: { t: Tool; role: string; stack: string; position: number }) {
  return <li className="rounded-xl border bg-white p-4">
    <div className="flex items-baseline justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><Monogram name={t.name} slug={t.slug} size={28} /><Link href={`/tools/${t.slug}`} className="hover:text-indigo-600">{t.name}</Link></h2><span className="text-sm text-slate-500">{role}</span></div>
    <p className="my-1 text-sm text-slate-700">{t.description}</p><Tags tags={t.tags} /><div className="mt-2"><Price t={t} /></div><div className="mt-3 sm:max-w-xs"><Cta t={t} anchor={stack} placement="stack" position={position} /></div></li>;
}
