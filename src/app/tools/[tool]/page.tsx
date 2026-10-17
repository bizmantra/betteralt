import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Tags, Price, JsonLd } from "@/components/ui";
import { tools, getTool, getAnchor, anchors, fmtStars, fmtDate } from "@/lib/data";
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
  return <div className="max-w-3xl space-y-6"><JsonLd data={ld} />
    <Crumbs items={[{ name: t.name }]} />
    {t.statusNote && <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><strong>{t.status === "renamed" ? "Renamed" : t.status === "acquired" ? "Acquired · no longer maintained" : "Shut down"}:</strong> {t.statusNote} Sources: {t.statusSources?.map((u, i) => <a key={u} href={u} className="underline" target="_blank" rel="nofollow noopener">{i ? ", " : ""}{new URL(u).hostname}</a>)}</div>}
    <div><h1 className="text-3xl font-bold">{t.name}</h1><p className="text-sm uppercase text-slate-500">{t.category}</p>
      <p className="text-xs text-slate-500">Updated {fmtDate(lastmodTool(t.slug))}</p>
      <p className="mt-3 text-lg text-slate-700">{t.description}</p><div className="mt-3"><Tags tags={t.tags} /></div>
      <a href={t.url} target="_blank" rel="nofollow noopener" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">Visit {t.name} ↗</a></div>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Pricing</h2><Price t={t} />
      <p className="mt-2 text-xs text-slate-500">Prices are in US dollars as published on the vendor&apos;s own pricing page, never converted. Where the vendor also publishes an India (INR) price, we show it as a second line with its own source and date.</p></section>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Who it&apos;s for</h2><p>{t.whoFor}</p></section>
    {o && <section className="rounded-xl border bg-white p-5"><h2 className="mb-2 text-xl font-semibold">Open source</h2>
      <ul className="space-y-1 text-sm"><li>Repository: <a className="underline" href={o.repo}>{o.repo.replace("https://github.com/", "")}</a></li><li>GitHub stars: {fmtStars(o.stars)} (as of Oct 2026)</li><li>Licence: {o.license}</li>
      {o.setupDifficulty && <li>Setup difficulty: {o.setupDifficulty}/5</li>}<li>Last commit pushed: {o.lastPush}{o.archived ? " (repository archived)" : ""}</li></ul></section>}
    {getAnchor(t.slug) && <Link href={`/alternatives/${t.slug}`} className="block rounded-xl border border-indigo-300 bg-indigo-50 p-4 font-medium">See {getAnchor(t.slug)!.alternatives.length} alternatives to {t.name} →</Link>}
    {altOf.length > 0 && <section><h2 className="mb-2 text-xl font-semibold">{t.name} is an alternative to</h2><div className="flex flex-wrap gap-2">{altOf.map((a) => <Link key={a.slug} href={`/alternatives/${a.slug}`} className="rounded-full border bg-white px-3 py-1 text-sm">{a.name}</Link>)}</div></section>}
  </div>;
}
