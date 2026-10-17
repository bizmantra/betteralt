import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Tags, Price, JsonLd, Newsletter } from "@/components/ui";
import { tools, getTool, getAnchor, anchors, fmtStars, site } from "@/lib/data";
import Monogram from "@/components/Monogram";
import Cta from "@/components/slots/Cta";
import Byline from "@/components/slots/Byline";
import { webPageLd } from "@/components/seo";
import { getPerson } from "@/lib/data";
import { indexableAnchors } from "@/lib/seo";
import { lastmodTool } from "@/lib/seo";
import { buildMetadata, Crumbs } from "@/components/seo";

export const dynamicParams = false;
export const generateStaticParams = () => tools.map((t) => ({ tool: t.slug }));
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params; const t = getTool(tool)!;
  const title = `${t.name} pricing, features and alternatives`;
  return buildMetadata({ title, description: `${t.description} ${t.pricing.summary ? "Pricing: " + t.pricing.summary + "." : ""}`, path: `/tools/${tool}`, ogImage: `/tools/${tool}/opengraph-image` });
}
export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool); if (!t) notFound();
  const altOf = anchors.filter((a) => a.alternatives.includes(t.slug)).map((a) => getTool(a.slug)!);
  const o = t.openSource;
  const ld: Record<string, unknown> = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: t.name, url: t.url, applicationCategory: /cod|IDE|developer|agent/i.test(t.category) ? "DeveloperApplication" : /image|design|video|audio|voice|music|photo/i.test(t.category) ? "MultimediaApplication" : "BusinessApplication", keywords: t.category, description: t.description, ...(t.formerNames ? { alternateName: t.formerNames } : {}) };
  if (t.pricing.fromUsdMonthly != null && (t.pricing.currency ?? "USD") === "USD") ld.offers = [{ "@type": "Offer", price: t.pricing.fromUsdMonthly, priceCurrency: "USD", url: t.pricing.sourceUrl, validFrom: t.pricing.lastChecked, priceSpecification: { "@type": "UnitPriceSpecification", price: t.pricing.fromUsdMonthly, priceCurrency: "USD", billingDuration: "P1M" } }];
  return <div className="max-w-3xl space-y-6" data-page-type="tool"><JsonLd data={ld} /><JsonLd data={webPageLd({ path: `/tools/${t.slug}`, name: t.name, published: t.firstPublished, modified: lastmodTool(t.slug), reviewer: getPerson(t.notes?.reviewedBy) })} />
    <Crumbs items={[{ name: t.name }]} />
    {t.statusNote && <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><strong>{site.statusLabels?.[t.status!] ?? t.status}:</strong> {t.statusNote} Sources: {t.statusSources?.map((u, i) => <a key={u} href={u} className="underline" target="_blank" rel="nofollow noopener">{i ? ", " : ""}{new URL(u).hostname}</a>)}</div>}
    <div><div className="flex items-center gap-3"><Monogram name={t.name} slug={t.slug} size={56} /><div><h1 className="font-serif text-3xl font-semibold">{t.name}</h1><p className="text-sm uppercase text-ink-2">{t.category}</p></div></div>
      <Byline reviewedBy={t.notes?.reviewedBy} authors={t.notes?.authors} updated={lastmodTool(t.slug)} checked={[t.pricing.lastChecked]} />
      <p className="mt-3 text-lg text-slate-700">{t.description}</p><div className="mt-3"><Tags tags={t.tags} /></div>
      <div className="mt-4 max-w-xs"><Cta t={t} placement="tool_page" /></div></div>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Pricing</h2><Price t={t} />
      </section>
    <section id="how-we-picked" className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">How we check prices</h2><p className="text-sm">{site.disclosure?.pricePolicy} Every price links to its source with the date we checked it. {site.disclosures?.aiAssisted}</p></section>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Who it&apos;s for</h2><p>{t.whoFor}</p></section>
    {o && <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Open source</h2>
      <ul className="space-y-1 text-sm"><li>Repository: <a className="underline" href={o.repo}>{o.repo.replace("https://github.com/", "")}</a></li><li>GitHub stars: {fmtStars(o.stars)} (as of Oct 2026)</li><li>Licence: {o.license}</li>
      {o.setupDifficulty && <li>Setup difficulty: {o.setupDifficulty}/5</li>}<li>Last commit pushed: {o.lastPush}{o.archived ? " (repository archived)" : ""}</li></ul></section>}
    {getAnchor(t.slug) && indexableAnchors().some((a) => a.slug === t.slug) && <Link href={`/alternatives/${t.slug}`} className="block rounded-xl border border-[1.5px] border-ink bg-white p-4 font-medium">See {getAnchor(t.slug)!.alternatives.length} alternatives to {t.name} →</Link>}
    {altOf.length > 0 && <section><h2 className="mb-2 text-xl font-semibold">{t.name} is an alternative to</h2><div className="flex flex-wrap gap-2">{altOf.map((a) => <Link key={a.slug} href={`/alternatives/${a.slug}`} className="rounded-full border bg-white px-3 py-1 text-sm">{a.name}</Link>)}</div></section>}
    <Newsletter source={`tools/${t.slug}`} placement="end" />
  </div>;
}
