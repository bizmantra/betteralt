import { tools, anchors, saas, stacks, getTool, SITE } from "@/lib/data";
export const dynamic = "force-static";
export function GET() {
  const l = [
    "# BetterAlt", "", "> Find a better or cheaper alternative to any AI tool, with today's prices in USD (India INR prices shown as a secondary line where the vendor publishes them; never converted). Every price links to the vendor's official pricing page with a last-checked date (latest check 18 Oct 2026). Unverified prices are marked 'See pricing'.", "",
    "## Alternatives pages", ...anchors.map((a) => `- [Alternatives to ${getTool(a.slug)!.name}](${SITE}/alternatives/${a.slug}): ${a.alternatives.length} alternatives`), "",
    "## AI alternatives to classic software", ...saas.map((s) => `- [AI alternative to ${s.name}](${SITE}/ai-alternative-to/${s.slug})`), "",
    "## Stacks", ...stacks.map((s) => `- [${s.title}](${SITE}/stacks/${s.slug}): ${s.intro}`), "",
    "## Tools", ...tools.map((t) => `- [${t.name}](${SITE}/tools/${t.slug}): ${t.description} Pricing${t.pricing.currency && t.pricing.currency !== "USD" ? ` (${t.pricing.currency}; USD not available)` : ""}: ${t.pricing.summary ?? "see " + t.pricing.sourceUrl}${t.pricing.india ? ` | India: ${t.pricing.india.summary}` : ""}`), "",
    "## Optional", `- [Open-source AI tools](${SITE}/open-source)`, `- [Price changes](${SITE}/changes)`, `- [About and methodology](${SITE}/about)`, `- [Privacy policy](${SITE}/privacy)`, `- [Terms of use](${SITE}/terms)`,
  ];
  return new Response(l.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
