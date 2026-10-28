import type { MetadataRoute } from "next";
import { SITE, tools, stacks } from "@/lib/data";
import { lastmodLocal, lastmodFree, lastmodTeachers } from "@/lib/batch1";
import { indexableAnchors, indexableSaas, variants, lastmodAnchor, lastmodVariant, lastmodTool, lastmodSaas, lastmodStack, lastmodHome, lastmodOpenSource, lastmodChangesPage, lastmodStacks, STATIC_LASTMOD } from "@/lib/seo";
// lastModified = real change dates from the data (spec §4), never the build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string, d: string) => ({ url: SITE + p, lastModified: d });
  return [
    u("", lastmodHome()), u("/open-source", lastmodOpenSource()), u("/stacks", lastmodStacks()), u("/changes", lastmodChangesPage()),
    u("/categories/local-ai", lastmodLocal()), u("/free-ai-tools", lastmodFree()), u("/teachers/ai-lesson-plan-generator", lastmodTeachers()),
    ...Object.entries(STATIC_LASTMOD).map(([p, d]) => u(p, d)),
    ...indexableAnchors().map((a) => u(`/alternatives/${a.slug}`, lastmodAnchor(a.slug))),
    ...variants().ok.map((v) => u(`/alternatives/${v.tool}/${v.filter}`, lastmodVariant(v.tool, v.filter))),
    ...tools.map((t) => u(`/tools/${t.slug}`, lastmodTool(t.slug))),
    ...indexableSaas().map((s) => u(`/ai-alternative-to/${s.slug}`, lastmodSaas(s.slug))),
    ...stacks.map((s) => u(`/stacks/${s.slug}`, lastmodStack(s.slug))),
  ];
}
