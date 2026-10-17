import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Grid, JsonLd, itemList, Price } from "@/components/ui";
import { saas, getTool } from "@/lib/data";
import { indexableSaas, lastmodSaas, monthYear } from "@/lib/seo";
import { buildMetadata, Crumbs } from "@/components/seo";
export const dynamicParams = false;
export const generateStaticParams = () => indexableSaas().filter((s) => s.alternatives.length >= 3).map((s) => ({ saas: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ saas: string }> }): Promise<Metadata> {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k)!;
  return buildMetadata({ title: `AI alternatives to ${s.name} (${monthYear(lastmodSaas(k))})`, description: `${s.alternatives.length} AI-powered alternatives to ${s.name}, with today's prices and free options.`, path: `/ai-alternative-to/${k}` });
}
export default async function Page({ params }: { params: Promise<{ saas: string }> }) {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k); if (!s) notFound();
  const items = s.alternatives.map((x) => getTool(x)!); const base = getTool(s.toolSlug)!;
  return <div className="space-y-6"><JsonLd data={itemList(`AI alternatives to ${s.name}`, items)} />
    <Crumbs items={[{ name: `AI alternatives to ${s.name}` }]} />
    <h1 className="text-3xl font-bold">AI alternatives to {s.name}</h1>
    <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">{s.name} pricing</p><Price t={base} /></div>
    <Grid items={items} /></div>;
}
