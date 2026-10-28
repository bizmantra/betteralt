import { BRAND } from "@/lib/data";
import { changes, getTool, SITE, newToolBatches, fmtDate } from "@/lib/data";
export const dynamic = "force-static";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function GET() {
  const log = [...changes].sort((a, b) => b.date.localeCompare(a.date));
  const items: string[] = log.map((c) => { const id = c.id ?? `${c.date}-${c.slug}`, t = getTool(c.slug), name = t?.name ?? c.slug;
    return `<item><title>${esc(`${c.type === "correction" ? "Correction to our data, " : ""}${name}${c.region === "IN" ? " (India)" : ""}: ${c.old} → ${c.new}`)}</title><link>${SITE}/changes#${id}</link><guid isPermaLink="false">${id}</guid><pubDate>${new Date(c.date + "T00:00:00Z").toUTCString()}</pubDate><description>${esc(`${name}: ${c.type === "correction" ? "correction of our stored price (not a vendor price change)" : "vendor price change"}. Old: ${c.old}. New: ${c.new}. Source: ${c.sourceUrl}`)}</description></item>`; });
  const added = newToolBatches.map((b) => { const names = b.tools.map((t) => t.name).join(", ");
    return { date: b.date, xml: `<item><title>${esc(`New tools added ${fmtDate(b.date)}: ${names}`)}</title><link>${SITE}/changes#${b.id}</link><guid isPermaLink="false">${b.id}</guid><pubDate>${new Date(b.date + "T00:00:00Z").toUTCString()}</pubDate><description>${esc(`${b.tools.length} tools added to our catalogue (not a vendor price change): ${b.tools.map((t) => `${t.name} (${SITE}/tools/${t.slug})`).join("; ")}`)}</description></item>` }; });
  const all = [...log.map((c, i) => ({ date: c.date, xml: items[i] })), ...added].sort((a, b) => b.date.localeCompare(a.date));
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${BRAND}: AI tool price changes</title><link>${SITE}/changes</link><atom:link href="${SITE}/changes/rss.xml" rel="self" type="application/rss+xml"/><description>Every AI tool price change we log, with old price, new price, date and the vendor source, plus new tools added to the catalogue.</description><language>en-us</language>${all[0] ? `<lastBuildDate>${new Date(all[0].date + "T00:00:00Z").toUTCString()}</lastBuildDate>` : ""}${all.map((x) => x.xml).join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
