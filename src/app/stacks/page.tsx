import { buildMetadata, Crumbs } from "@/components/seo";
import Link from "next/link";
import type { Metadata } from "next";
import { stacks } from "@/lib/data";
export const metadata: Metadata = buildMetadata({ title: "AI tool stacks by job", description: "Hand-picked AI tool stacks for specific jobs, with what each tool does and what it costs.", path: "/stacks" });
export default function Page() {
  return <div className="space-y-4"><Crumbs items={[{ name: "Stacks" }]} /><h1 className="text-3xl font-bold">AI tool stacks</h1>
    {stacks.map((s) => <Link key={s.slug} href={`/stacks/${s.slug}`} className="block rounded-xl border bg-white p-5 hover:border-indigo-400"><p className="text-lg font-semibold">{s.title}</p><p className="text-slate-600">{s.intro}</p></Link>)}</div>;
}
