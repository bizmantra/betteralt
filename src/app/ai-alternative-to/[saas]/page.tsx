import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { saas, getTool, type Tool } from "@/lib/data";
import { indexableSaas, lastmodSaas, monthYear } from "@/lib/seo";
import { buildMetadata } from "@/components/seo";
import AltTemplate from "@/components/AltTemplate";
export const dynamicParams = false;
export const generateStaticParams = () => indexableSaas().filter((s) => s.alternatives.length >= 3).map((s) => ({ saas: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ saas: string }> }): Promise<Metadata> {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k)!;
  const title = `AI alternatives to ${s.name} (${monthYear(lastmodSaas(k))})`;
  return { ...buildMetadata({ title, description: `${s.alternatives.length} AI-powered alternatives to ${s.name}, with USD prices from vendor pricing pages, free options, sources and checked dates.`, path: `/ai-alternative-to/${k}` }), title: { absolute: title } };
}
export default async function Page({ params }: { params: Promise<{ saas: string }> }) {
  const { saas: k } = await params; const s = saas.find((x) => x.slug === k); if (!s) notFound();
  const items = s.alternatives.map((x) => getTool(x)).filter(Boolean) as Tool[];
  return <AltTemplate pageType="saas" path={`/ai-alternative-to/${k}`} slug={k} anchorTool={getTool(s.toolSlug)} subjectName={s.name}
    h1={`AI alternatives to ${s.name}, honestly compared, with prices`} crumbs={[{ name: `AI alternatives to ${s.name}` }]}
    items={items} summary={s.summary} verdict={s.verdict} faq={s.faq} reviewedBy={s.reviewedBy} authors={s.authors} updated={lastmodSaas(k)} published={s.firstPublished}
    filterKeys={[]} extra={s.replaces} keepVsSwitch={s.keepVsSwitch} />;
}
