import { BRAND } from "@/lib/data";
import { ogCard, ogSize } from "@/lib/og";
import { tools, fmtDate } from "@/lib/data";
export const size = ogSize; export const contentType = "image/png"; export const alt = `${BRAND}: find the AI tool that actually fits you, and what it really costs`;
export default function Image() {
  const latest = tools.map((t) => t.pricing.lastChecked).sort().at(-1)!;
  return ogCard({ title: "Find the AI tool that actually fits you, and what it really costs", checked: fmtDate(latest), line: `${tools.length} tools · prices checked ${fmtDate(latest)}` });
}
