import { ogCard, ogSize } from "@/lib/og";
import { getTool, altsOf, fmtDate, isFree } from "@/lib/data";
import { indexableAnchors } from "@/lib/seo";
import { picks } from "@/lib/picks";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Alternatives on BetterAlt";
export const generateStaticParams = () => indexableAnchors().map((a) => ({ tool: a.slug }));
const short = (s: string | null) => (s ?? "").split(";")[0].replace(/\s*\(.*?\)/g, "");
export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool)!; const alts = altsOf(tool);
  const pk = picks(alts, undefined, getTool);
  const ds = [t, ...alts].map((x) => x.pricing.lastChecked).sort(); const checked = fmtDate(ds.at(-1)!);
  const lines = pk.map((p) => ({ name: p.tool.name, slug: p.tool.slug, text: `${p.label} · ${p.tool.name}${p.kind === "budget" && p.tool.pricing.fromUsdMonthly ? ` · from $${p.tool.pricing.fromUsdMonthly}/mo` : p.kind === "free" ? ` · ${short(p.tool.pricing.summary) || "free plan"}` : ""}` }));
  return ogCard({ title: `${t.name} alternatives`, checked, lines, line: `${alts.length} compared · ${alts.filter(isFree).length} with a free option` });
}
