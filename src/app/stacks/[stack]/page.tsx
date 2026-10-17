import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, Price, Tags } from "@/components/ui";
import { stacks, getTool } from "@/lib/data";
import { buildMetadata, Crumbs } from "@/components/seo";
export const dynamicParams = false;
export const generateStaticParams = () => stacks.map((s) => ({ stack: s.slug }));
export async function generateMetadata({ params }: { params: Promise<{ stack: string }> }): Promise<Metadata> {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack)!;
  return buildMetadata({ title: s.title, description: s.intro, path: `/stacks/${stack}`, type: "article" });
}
export default async function Page({ params }: { params: Promise<{ stack: string }> }) {
  const { stack } = await params; const s = stacks.find((x) => x.slug === stack); if (!s) notFound();
  return <div className="max-w-3xl space-y-6">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: s.title, itemListElement: s.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: getTool(it.tool)!.name, url: `https://findbetteralt.com/tools/${it.tool}` })) }} />
    <Crumbs items={[{ name: "Stacks", href: "/stacks" }, { name: s.title }]} />
    <h1 className="text-3xl font-bold">{s.title}</h1><p className="text-slate-600">{s.intro}</p>
    <ol className="space-y-3">{s.items.map((it, i) => { const t = getTool(it.tool)!; return <li key={it.tool} className="rounded-xl border bg-white p-4">
      <div className="flex items-baseline justify-between gap-2"><h2 className="text-lg font-semibold">{i + 1}. <Link href={`/tools/${t.slug}`} className="hover:text-indigo-600">{t.name}</Link></h2><span className="text-sm text-slate-500">{it.role}</span></div>
      <p className="my-1 text-sm text-slate-700">{t.description}</p><Tags tags={t.tags} /><div className="mt-2"><Price t={t} /></div></li>; })}</ol>
  </div>;
}
