import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, getAnchor, altsOf, FILTERS, filtered, type FilterKey } from "@/lib/data";
import { variants, lastmodVariant, monthYear } from "@/lib/seo";
import { buildMetadata } from "@/components/seo";
import AltTemplate from "@/components/AltTemplate";

export const dynamicParams = false;
export const generateStaticParams = () => variants().ok.map((v) => ({ tool: v.tool, filter: v.filter }));
export async function generateMetadata({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }): Promise<Metadata> {
  const { tool, filter } = await params; const t = getTool(tool)!;
  const title = `${FILTERS[filter].title} to ${t.name} (${monthYear(lastmodVariant(tool, filter))})`;
  return { ...buildMetadata({ title, description: `${filtered(tool, filter).length} ${FILTERS[filter].title.toLowerCase()} to ${t.name}, with USD prices from vendor pricing pages, sources and checked dates.`, path: `/alternatives/${tool}/${filter}` }), title: { absolute: title } };
}
export default async function Page({ params }: { params: Promise<{ tool: string; filter: FilterKey }> }) {
  const { tool, filter } = await params; const t = getTool(tool); const a = getAnchor(tool); if (!t || !a || !FILTERS[filter]) notFound();
  return <AltTemplate pageType="variant" path={`/alternatives/${tool}/${filter}`} slug={tool} anchorTool={t} subjectName={t.name}
    h1={`${FILTERS[filter].title} to ${t.name}, honestly compared, with prices`} crumbs={[{ name: `${t.name} alternatives`, href: `/alternatives/${tool}` }, { name: FILTERS[filter].title }]}
    items={filtered(tool, filter)} meta={a.meta} summary={a.filterIntros?.[filter]} reviewedBy={a.reviewedBy} authors={a.authors} updated={lastmodVariant(tool, filter)} published={a.firstPublished}
    filterKeys={variants().ok.filter((v) => v.tool === tool).map((v) => v.filter)} activeFilter={filter} parentCount={altsOf(tool).length} />;
}
