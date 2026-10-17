import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AltFilter from "@/components/AltFilter";
import { ToolCard, JsonLd, itemList, Price, Newsletter } from "@/components/ui";
import { anchors, getTool, altsOf, FILTERS, filtered, MIN, type FilterKey } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => anchors.filter((a) => altsOf(a.slug).length >= MIN).map((a) => ({ tool: a.slug }));
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params; const t = getTool(tool)!; const n = altsOf(tool).length;
  const title = `${n} best ${t.name} alternatives (Oct 2026), with prices`;
  const description = `Compare ${n} alternatives to ${t.name}: free, open-source, self-hosted and cheaper options, with prices taken from vendor pricing pages and dated.`;
  return { title, description, alternates: { canonical: `/alternatives/${tool}` }, openGraph: { title, description, url: `/alternatives/${tool}` } };
}
export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool); if (!t) notFound();
  const alts = altsOf(tool);
  const keys = alts.map((a) => ({ slug: a.slug, flags: (Object.keys(FILTERS) as FilterKey[]).filter((f) => FILTERS[f].test(a, t)) }));
  const subs = (Object.keys(FILTERS) as FilterKey[]).filter((f) => filtered(tool, f).length >= MIN);
  const free = alts.filter((a) => FILTERS.free.test(a)).map((a) => a.name);
  const oss = alts.filter((a) => FILTERS["open-source"].test(a)).map((a) => a.name);
  const faq = [
    { q: `What are the best alternatives to ${t.name}?`, a: `Popular alternatives to ${t.name} include ${alts.slice(0, 5).map((a) => a.name).join(", ")}.` },
    ...(free.length ? [{ q: `Is there a free alternative to ${t.name}?`, a: `Yes. ${free.join(", ")} ${free.length > 1 ? "offer" : "offers"} a free plan or free version.` }] : []),
    ...(oss.length ? [{ q: `Is there an open-source alternative to ${t.name}?`, a: `Yes: ${oss.join(", ")}.` }] : []),
  ];
  return <div className="space-y-8">
    <JsonLd data={itemList(`Alternatives to ${t.name}`, alts)} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    <div><p className="text-sm text-slate-500"><Link href="/">Home</Link> / Alternatives</p>
      <h1 className="mt-1 text-3xl font-bold">{alts.length} best {t.name} alternatives</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{t.name}: {t.description}</p>
      <div className="mt-3 rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">{t.name} pricing</p><Price t={t} /></div>
      {subs.length > 0 && <p className="mt-3 text-sm">Shortcuts: {subs.map((f) => <Link key={f} className="mr-3 text-indigo-600 underline" href={`/alternatives/${tool}/${f}`}>{FILTERS[f].title}</Link>)}</p>}
    </div>
    <AltFilter keys={keys}>{alts.map((a) => <ToolCard key={a.slug} t={a} />)}</AltFilter>
    <section className="rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">FAQ</h2>
      {faq.map((f) => <div key={f.q} className="mt-3"><h3 className="font-medium">{f.q}</h3><p className="text-sm text-slate-600">{f.a}</p></div>)}</section>
    <Newsletter />
  </div>;
}
