import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Grid, JsonLd, itemList } from "@/components/ui";
import { getTool, FILTERS, filtered, type FilterKey } from "@/lib/data";
import { variants, lastmodVariant, monthYear } from "@/lib/seo";
import { buildMetadata, Crumbs } from "@/components/seo";

export const dynamicParams = false;
export const generateStaticParams = () => variants().ok.map((v) => ({ tool: v.tool, filter: v.filter }));
export async function generateMetadata({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }): Promise<Metadata> {
  const { tool, filter } = await params; const t = getTool(tool)!;
  const title = `${FILTERS[filter].title} to ${t.name} (${monthYear(lastmodVariant(tool, filter))})`;
  return buildMetadata({ title, description: `${filtered(tool, filter).length} ${FILTERS[filter].title.toLowerCase()} to ${t.name}, with prices taken from vendor pricing pages and dated.`, path: `/alternatives/${tool}/${filter}` });
}
export default async function Page({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }) {
  const { tool, filter } = await params; const t = getTool(tool); if (!t || !FILTERS[filter]) notFound();
  const items = filtered(tool, filter);
  return <div className="space-y-6"><JsonLd data={itemList(`${FILTERS[filter].title} to ${t.name}`, items)} />
    <Crumbs items={[{ name: "Alternatives" }, { name: `${t.name} alternatives`, href: `/alternatives/${tool}` }, { name: FILTERS[filter].title }]} />
    <h1 className="text-3xl font-bold">{FILTERS[filter].title} to {t.name}</h1>
    {filter === "cheaper" && <p className="text-sm text-slate-600">Compared on the lowest verified paid price per month. {t.name}: {t.pricing.summary}</p>}
    <Grid items={items} /></div>;
}
