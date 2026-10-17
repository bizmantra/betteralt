import Link from "next/link";
import type { Metadata } from "next";
import { tools } from "@/lib/data";
export const metadata: Metadata = { title: "AI tool price changes", description: "A running log of AI tool price changes. Tracking began 17 Oct 2026.", alternates: { canonical: "/changes" } };
export default function Page() {
  const tracked = tools.filter((t) => t.pricing.verified);
  return <div className="max-w-3xl space-y-6"><h1 className="text-3xl font-bold">Price changes</h1>
    <p className="text-slate-600">We re-check vendor pricing pages and log every change here, with the old price, the new price and the source. No changes yet: tracking began on 17 Oct 2026.</p>
    <ul className="divide-y rounded-xl border bg-white">{tracked.map((t) => <li key={t.slug} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
      <span><span className="text-slate-500">17 Oct 2026 · </span><Link className="font-medium hover:text-indigo-600" href={`/tools/${t.slug}`}>{t.name}</Link>: tracking began</span>
      <span className="text-slate-600">{t.pricing.summary}</span></li>)}</ul></div>;
}
