import { BRAND } from "@/lib/data";
import { changes, getTool, SITE } from "@/lib/data";
export const dynamic = "force-static";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function GET() {
  const log = [...changes].sort((a, b) => b.date.localeCompare(a.date));
  const items = log.map((c) => { const id = c.id ?? `${c.date}-${c.slug}`, t = getTool(c.slug), name = t?.name ?? c.slug;
    return `<item><title>${esc(`${c.type === "correction" ? "Correction to our data, " : ""}${name}${c.region === "IN" ? " (India)" : ""}: ${c.old} → ${c.new}`)}</title><link>${SITE}/changes#${id}</link><guid isPermaLink="false">${id}</guid><pubDate>${new Date(c.date + "T00:00:00Z").toUTCString()}</pubDate><description>${esc(`${name}: ${c.type === "correction" ? "correction of our stored price (not a vendor price change)" : "vendor price change"}. Old: ${c.old}. New: ${c.new}. Source: ${c.sourceUrl}`)}</description></item>`; }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${BRAND}: AI tool price changes</title><link>${SITE}/changes</link><atom:link href="${SITE}/changes/rss.xml" rel="self" type="application/rss+xml"/><description>Every AI tool price change we log, with old price, new price, date and the vendor source.</description><language>en-us</language>${log[0] ? `<lastBuildDate>${new Date(log[0].date + "T00:00:00Z").toUTCString()}</lastBuildDate>` : ""}${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
