import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Grid, JsonLd, itemList, Price } from "@/components/ui";
import { saas, getTool, MIN } from "@/lib/data";
export const dynamicParams = false;
export const generateStaticParams = () => saas.filter((s) => s.alternatives.length >= MIN).map((s) => ({ saas: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ saas: string }> }): Promise<Metadata> {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k)!;
  return { title: `AI alternatives to ${s.name} (Oct 2026)`, description: `${s.alternatives.length} AI-powered alternatives to ${s.name}, with today's prices and free options.`, alternates: { canonical: `/ai-alternative-to/${k}` } };
}
export default async function Page({ params }: { params: Promise<{ saas: string }> }) {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k); if (!s) notFound();
  const items = s.alternatives.map((x) => getTool(x)!); const base = getTool(s.toolSlug)!;
  return <div className="space-y-6"><JsonLd data={itemList(`AI alternatives to ${s.name}`, items)} />
    <h1 className="text-3xl font-bold">AI alternatives to {s.name}</h1>
    <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">{s.name} pricing</p><Price t={base} /></div>
    <Grid items={items} /></div>;
}
