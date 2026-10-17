import type { MetadataRoute } from "next";
// All crawlers allowed, including AI crawlers (GPTBot, ClaudeBot, etc.), per Roshan. Only /api/ is disallowed.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: "https://findbetteralt.com/sitemap.xml" };
}
