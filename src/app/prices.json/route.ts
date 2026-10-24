import { tools } from "@/lib/data";

// Verified prices only (gate-checked), for roshan-kumar.com's build pages. Static, rebuilt with every deploy.
export const dynamic = "force-static";

export function GET() {
  const list = tools
    .filter((t) => t.pricing.verified && t.pricing.sourceUrl && t.pricing.lastChecked)
    .map((t) => ({
      slug: t.slug,
      name: t.name,
      url: t.url,
      summary: t.pricing.summary,
      fromUsdMonthly: t.pricing.fromUsdMonthly ?? null,
      hasFreePlan: !!t.pricing.hasFreePlan,
      verified: true,
      sourceUrl: t.pricing.sourceUrl,
      lastChecked: t.pricing.lastChecked,
    }));
  return Response.json(list, { headers: { "Cache-Control": "public, max-age=3600" } });
}
