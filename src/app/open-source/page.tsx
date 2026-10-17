import { buildMetadata, Crumbs } from "@/components/seo";
import type { Metadata } from "next";
import { Grid, JsonLd, itemList } from "@/components/ui";
import { tools, isOss } from "@/lib/data";
export const metadata: Metadata = buildMetadata({ title: "Open-source and self-hosted AI tools", description: "Open-source alternatives to popular AI tools, with GitHub stars, licence and setup difficulty.", path: "/open-source" });
export default function Page() {
  const items = tools.filter(isOss).sort((a, b) => (b.openSource?.stars ?? 0) - (a.openSource?.stars ?? 0));
  return <div className="space-y-6"><JsonLd data={itemList("Open-source AI tools", items)} />
    <Crumbs items={[{ name: "Open source" }]} /><h1 className="text-3xl font-bold">Open-source AI tools ({items.length})</h1>
    <p className="max-w-3xl text-slate-600">Sorted by GitHub stars (fetched from the GitHub API on 17 Oct 2026). Setup difficulty: 1 = install an app, 5 = needs a GPU server and ops skills. &quot;Custom / see repo&quot; means GitHub can&apos;t classify the licence (often fair-code or open-core); check the repo before using commercially.</p>
    <Grid items={items} /></div>;
}
