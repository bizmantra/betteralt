import { ogCard, ogSize } from "@/lib/og";
import { tools, getTool, fmtDate } from "@/lib/data";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Tool pricing on BetterAlt";
export const generateStaticParams = () => tools.map((t) => ({ tool: t.slug }));
export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool)!; const p = t.pricing;
  const usd = (p.currency ?? "USD") === "USD" && p.fromUsdMonthly != null;
  const big = usd ? `from $${p.fromUsdMonthly}/mo${p.fromBilling === "annual" ? " (annual)" : ""}` : p.hasFreePlan ? "Free plan available" : undefined;
  let domain = ""; try { domain = new URL(p.sourceUrl).hostname.replace(/^www\./, ""); } catch {}
  return ogCard({ title: `${t.name} pricing`, big, line: big ? undefined : (p.summary ?? "See the vendor pricing page").replace(/₹\s?/g, "INR "), foot: `Checked ${fmtDate(p.lastChecked)} · source: ${domain}` });
}
