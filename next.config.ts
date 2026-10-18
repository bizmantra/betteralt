import type { NextConfig } from "next";
import { seoRedirects, indexableCounts, variants } from "./src/lib/seo";

// Security headers (18 Oct). The ENFORCED CSP only sets directives that can't break the site (no framing, no <base>
// or plugin injection, forms post to us, upgrade http subresources). The full allow-list policy runs as
// Content-Security-Policy-Report-Only first: Next's static pages use inline scripts, and Roshan adds Google Analytics
// himself, so a strict enforced script-src would risk breaking both. Promote it once the console shows no violations.
const GA = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com";
const CSP = ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'", "form-action 'self'", "upgrade-insecure-requests"].join("; ");
const CSP_REPORT_ONLY = [
  "default-src 'self'", `script-src 'self' 'unsafe-inline' ${GA}`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:",
  "font-src 'self' data:", `connect-src 'self' ${GA}`, "frame-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'",
].join("; ");
const securityHeaders = [
  // No includeSubDomains/preload: other findbetteralt.com hosts (mail DNS at Hostinger) aren't all known to serve HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: CSP },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
