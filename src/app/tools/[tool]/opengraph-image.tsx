import { ogCard, ogSize } from "@/lib/og";
import { tools, getTool, fmtDate } from "@/lib/data";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Tool pricing on BetterAlt";
export const generateStaticParams = () => tools.map((t) => ({ tool: t.slug }));
export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params; const t = getTool(tool)!; const s = (t.pricing.summary ?? "See vendor pricing page").replace(/₹\s?/g, "INR ");
  return ogCard({ title: t.name, line: s.length > 90 ? s.slice(0, s.lastIndexOf(" ", 88)) + "…" : s, foot: `findbetteralt.com · prices checked ${fmtDate(t.pricing.lastChecked)}` });
}
