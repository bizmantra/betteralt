import { buildMetadata, Crumbs } from "@/components/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({ title: "Submit an AI tool", description: "Suggest an AI tool or alternative for BetterAlt.", path: "/submit" });
export default function Page() {
  return <div className="max-w-xl space-y-4"><Crumbs items={[{ name: "Submit a tool" }]} /><h1 className="text-3xl font-bold">Submit a tool</h1>
    <p className="text-slate-600">To submit a tool, email us at hello@findbetteralt.com with the tool name, URL, pricing page and what it&apos;s an alternative to. Free listings are reviewed in order; nothing is listed without checking the pricing page.</p>
    <a className="inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white" href="mailto:hello@findbetteralt.com?subject=Tool%20submission">Email a submission</a></div>;
}
