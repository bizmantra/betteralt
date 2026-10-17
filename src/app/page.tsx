import Link from "next/link";
import Search from "@/components/Search";
import { Newsletter } from "@/components/ui";
import type { Metadata } from "next";
import { tools, anchors, getTool, categories, stacks } from "@/lib/data";
import { indexableSaas } from "@/lib/seo";
import { buildMetadata } from "@/components/seo";
export const metadata: Metadata = { ...buildMetadata({ title: "BetterAlt: find a better or cheaper alternative to any AI tool", description: "Find a better or cheaper alternative to any AI tool, with today's prices in USD. Free, open-source and self-hosted options, with sources and last-checked dates.", path: "/" }), title: { absolute: "BetterAlt: find a better or cheaper alternative to any AI tool" } };

export default function Home() {
  const anchorSet = new Set(anchors.map((a) => a.slug));
  const items = tools.map((t) => ({ slug: t.slug, name: t.name, category: t.category, anchor: anchorSet.has(t.slug) }));
  const totalAlts = anchors.reduce((n, a) => n + a.alternatives.length, 0);
  return <div className="space-y-12">
    <section className="py-10 text-center">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Find a better or cheaper alternative to any AI tool, <span className="text-indigo-600">with today&apos;s prices.</span></h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">{tools.length} tools, {totalAlts} alternative listings. Prices in USD from each vendor&apos;s own pricing page, with a source and last-checked date (India prices too, where published). Free, open-source and self-hosted options included.</p>
      <div className="mt-8"><Search items={items} /></div>
    </section>
    <section><h2 className="mb-4 text-2xl font-semibold">Popular: find alternatives to…</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{anchors.map((a) => { const t = getTool(a.slug)!; return <Link key={a.slug} href={`/alternatives/${a.slug}`} className="rounded-xl border bg-white p-4 hover:border-indigo-400">
        <p className="font-semibold">{t.name}</p><p className="text-xs text-slate-500">{a.alternatives.length} alternatives</p></Link>; })}</div></section>
    <section><h2 className="mb-4 text-2xl font-semibold">AI alternatives to classic software</h2>
      <div className="flex flex-wrap gap-2">{indexableSaas().map((s) => <Link key={s.slug} href={`/ai-alternative-to/${s.slug}`} className="rounded-full border bg-white px-4 py-2 hover:border-indigo-400">AI alternative to {s.name}</Link>)}</div></section>
    <section><h2 className="mb-4 text-2xl font-semibold">AI tool stacks</h2>
      <div className="grid gap-3 sm:grid-cols-3">{stacks.map((s) => <Link key={s.slug} href={`/stacks/${s.slug}`} className="rounded-xl border bg-white p-4 hover:border-indigo-400"><p className="font-semibold">{s.title}</p><p className="text-sm text-slate-600">{s.intro}</p></Link>)}</div></section>
    <section><h2 className="mb-4 text-2xl font-semibold">Categories</h2>
      <div className="flex flex-wrap gap-2 text-sm">{categories().map(([c, n]) => <span key={c} className="rounded-full bg-white px-3 py-1 border">{c} <span className="text-slate-500">({n})</span></span>)}</div></section>
    <Newsletter source="home" />
  </div>;
}
