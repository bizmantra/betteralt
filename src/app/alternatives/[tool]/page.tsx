import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, altsOf, getAnchor } from "@/lib/data";
import { indexableAnchors, variants, lastmodAnchor, monthYear } from "@/lib/seo";
import { buildMetadata } from "@/components/seo";
import { altTitle } from "@/lib/titles";
import AltTemplate from "@/components/AltTemplate";

export const dynamicParams = false;
export const generateStaticParams = () => indexableAnchors().map((a) => ({ tool: a.slug }));
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params; const t = getTool(tool)!; const n = altsOf(tool).length;
  const title = altTitle(t.name, monthYear(lastmodAnchor(tool)));
  const description = `Compare ${n} alternatives to ${t.name}: free, open-source, self-hosted and paid options, with USD prices from vendor pricing pages, sources and checked dates.`;
  return { ...buildMetadata({ title, description, path: `/alternatives/${tool}`, ogImage: `/alternatives/${tool}/opengraph-image` }), title: { absolute: title } };
}
export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool); const a = getAnchor(tool); if (!t || !a) notFound();
  return <AltTemplate pageType="alternatives" path={`/alternatives/${tool}`} slug={tool} anchorTool={t} subjectName={t.name}
    h1={`${t.name} alternatives, honestly compared, with prices`} crumbs={[{ name: `${t.name} alternatives` }]}
    items={altsOf(tool)} meta={a.meta} summary={a.summary} verdict={a.verdict} redditSummary={a.redditSummary} howToChoose={a.howToChoose} faq={a.faq}
    reviewedBy={a.reviewedBy} authors={a.authors} updated={lastmodAnchor(tool)} published={a.firstPublished}
    filterKeys={variants().ok.filter((v) => v.tool === tool).map((v) => v.filter)} />;
}
