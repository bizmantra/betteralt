import { ogCard, ogSize } from "@/lib/og";
import { changes, getTool, fmtDate } from "@/lib/data";
export const size = ogSize; export const contentType = "image/png"; export const alt = "AI price changes on BetterAlt";
const clean = (x: string) => x.split(" (")[0].replace(/^Shopify Basic /, "").replace(/ billed (yearly|annually|monthly)/, "");
export default function Image() {
  const log = [...changes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const lines = log.map((c) => { const t = getTool(c.slug); const n = t?.name ?? c.slug; return { name: n, slug: c.slug, text: `${c.plan && t ? `${t.name.split(" ")[0]} ${c.plan}` : n}${c.region === "IN" ? " (India)" : ""} ${clean(c.old)} → ${clean(c.new)} · ${fmtDate(c.date).replace(/ \d{4}$/, "")}`.replace(/₹/g, "INR ") }; });
  return ogCard({ title: "AI price changes this week", checked: log[0] ? fmtDate(log[0].date) : undefined, lines, line: lines.length ? undefined : "No price changes logged yet" });
}
