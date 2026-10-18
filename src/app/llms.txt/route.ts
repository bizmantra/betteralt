import { BRAND } from "@/lib/data";
import { tools, anchors, stacks, getTool, SITE, fmtDate } from "@/lib/data";
import { indexableSaas } from "@/lib/seo";
export const dynamic = "force-static";
export function GET() {
  // Latest check = newest verified price check from the publishing gate (not a hard-coded date).
  const latest = tools.filter((t) => t.pricing.verified).map((t) => t.pricing.lastChecked).sort().at(-1);
  const l = [
    `# ${BRAND}`, "", `> Find a better or cheaper alternative to any AI tool. Prices are in US dollars (USD) from each vendor's own pricing page, with a source link and the date we last checked it${latest ? ` (latest check ${fmtDate(latest)})` : ""}. Where a vendor also publishes a local-currency price, it is shown as a secondary, labelled line and never converted. Prices we couldn't verify in the last 14 days are marked "not yet verified".`, "",
    "## Alternatives pages", ...anchors.map((a) => `- [Alternatives to ${getTool(a.slug)!.name}](${SITE}/alternatives/${a.slug}): ${a.alternatives.length} alternatives`), "",
    "## AI alternatives to classic software", ...indexableSaas().map((s) => `- [AI alternative to ${s.name}](${SITE}/ai-alternative-to/${s.slug})`), "",
    "## Stacks", ...stacks.map((s) => `- [${s.title}](${SITE}/stacks/${s.slug}): ${s.intro}`), "",
    "## Tools", ...tools.map((t) => `- [${t.name}](${SITE}/tools/${t.slug}): ${t.description} Pricing${t.pricing.currency && t.pricing.currency !== "USD" ? ` (${t.pricing.currency}; USD not available)` : ""}: ${t.pricing.summary ?? "see " + t.pricing.sourceUrl}${t.pricing.india ? ` | Secondary (India, INR): ${t.pricing.india.summary}` : ""}`), "",
    "## Optional", `- [Open-source AI tools](${SITE}/open-source)`, `- [Price changes](${SITE}/changes)`, `- [About and methodology](${SITE}/about)`, `- [Privacy policy](${SITE}/privacy)`, `- [Terms of use](${SITE}/terms)`,
  ];
  return new Response(l.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
