import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Grid, JsonLd, itemList } from "@/components/ui";
import { anchors, getTool, FILTERS, filtered, MIN, type FilterKey } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => anchors.flatMap((a) => (Object.keys(FILTERS) as FilterKey[]).filter((f) => filtered(a.slug, f).length >= MIN).map((f) => ({ tool: a.slug, filter: f })));
export async function generateMetadata({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }): Promise<Metadata> {
  const { tool, filter } = await params; const t = getTool(tool)!;
  const title = `${FILTERS[filter].title} to ${t.name} (Oct 2026)`;
  return { title, description: `${filtered(tool, filter).length} ${FILTERS[filter].title.toLowerCase()} to ${t.name}, with prices taken from vendor pricing pages and dated.`, alternates: { canonical: `/alternatives/${tool}/${filter}` } };
}
export default async function Page({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }) {
  const { tool, filter } = await params; const t = getTool(tool); if (!t || !FILTERS[filter]) notFound();
  const items = filtered(tool, filter);
  return <div className="space-y-6"><JsonLd data={itemList(`${FILTERS[filter].title} to ${t.name}`, items)} />
    <p className="text-sm text-slate-500"><Link href={`/alternatives/${tool}`}>← All {t.name} alternatives</Link></p>
    <h1 className="text-3xl font-bold">{FILTERS[filter].title} to {t.name}</h1>
    {filter === "cheaper" && <p className="text-sm text-slate-600">Compared on the lowest verified paid price per month. {t.name}: {t.pricing.summary}</p>}
    <Grid items={items} /></div>;
}
