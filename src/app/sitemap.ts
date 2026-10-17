import type { MetadataRoute } from "next";
import { SITE, tools, anchors, saas, stacks, altsOf, FILTERS, filtered, MIN, type FilterKey } from "@/lib/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => ({ url: SITE + p, lastModified: "2026-10-18" });
  return [
    ...["", "/open-source", "/stacks", "/changes", "/submit", "/sponsor", "/about", "/privacy", "/terms"].map(u),
    ...anchors.filter((a) => altsOf(a.slug).length >= MIN).map((a) => u(`/alternatives/${a.slug}`)),
    ...anchors.flatMap((a) => (Object.keys(FILTERS) as FilterKey[]).filter((f) => filtered(a.slug, f).length >= MIN).map((f) => u(`/alternatives/${a.slug}/${f}`))),
    ...tools.map((t) => u(`/tools/${t.slug}`)),
    ...saas.map((s) => u(`/ai-alternative-to/${s.slug}`)),
    ...stacks.map((s) => u(`/stacks/${s.slug}`)),
  ];
}
