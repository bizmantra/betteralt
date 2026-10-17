import type { NextConfig } from "next";
import { seoRedirects, indexableCounts, variants } from "./src/lib/seo";

const nextConfig: NextConfig = {
  async redirects() {
    const r = seoRedirects();
    console.log("[seo] indexable pages per template:", JSON.stringify(indexableCounts()));
    const why: Record<string, number> = {}; variants().failed.forEach((v) => { why[v.reason!] = (why[v.reason!] ?? 0) + 1; });
    console.log("[seo] filter variants redirected by reason:", JSON.stringify(why), "| total 308 rules:", r.length);
    return [
      { source: "/:path*", has: [{ type: "host", value: "www.findbetteralt.com" }], destination: "https://findbetteralt.com/:path*", permanent: true },
      ...r,
    ];
  },
};
export default nextConfig;
