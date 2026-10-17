import { ogCard, ogSize } from "@/lib/og";
import { getTool, altsOf, fmtDate } from "@/lib/data";
import { indexableAnchors, lastmodAnchor } from "@/lib/seo";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Alternatives on BetterAlt";
export const generateStaticParams = () => indexableAnchors().map((a) => ({ tool: a.slug }));
export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool)!; const alts = altsOf(tool);
  const paid = alts.filter((a) => (a.pricing.currency ?? "USD") === "USD" && a.pricing.fromUsdMonthly != null).sort((a, b) => a.pricing.fromUsdMonthly! - b.pricing.fromUsdMonthly!)[0];
  const free = alts.filter((a) => a.pricing.hasFreePlan || a.tags.includes("free")).length;
  return ogCard({ title: `${t.name} alternatives`, line: `${alts.length} compared · ${free} with a free option${paid ? ` · paid from $${paid.pricing.fromUsdMonthly}/mo (${paid.name})` : ""}`, foot: `findbetteralt.com · updated ${fmtDate(lastmodAnchor(tool))}` });
}
