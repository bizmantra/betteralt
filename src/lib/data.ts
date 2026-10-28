import db from "../data/db.json";

import type { Tool as SchemaTool, Anchor as SchemaAnchor, AnchorAlternative, Saas as SchemaSaas, Stack as SchemaStack, Person, PriceChange, SiteConfig } from "./content-schema";
import siteJson from "../data/site.json";
export type { AnchorAlternative, Person, PriceChange, SiteConfig };
export type Tool = SchemaTool & { pricing: SchemaTool["pricing"] & { extraSources?: string[] } };
export const SITE = "https://findbetteralt.com";
export const CHECKED = "18 Oct 2026";
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; };
import gate from "../data/gate.json";
// The publishing gate (scripts/validate-data.ts, run in prebuild) decides what counts as verified at build time:
// checked date = date of the newest snapshot that matches; snapshot older than 14 days or a dead source link → not yet verified.
type GateEntry = { verified: boolean; reason?: "stale" | "dead-link" | "never-verified"; checkedAt?: string; inCheckedAt?: string; snapshot?: string };
export const gateInfo = gate as unknown as { generatedAt: string; maxAgeDays: number; tools: Record<string, GateEntry>; dead: { url: string; slug: string; kind: string }[] };
export const deadUrls = new Set(gateInfo.dead.map((d) => d.url));
export const tools = (db.tools as unknown as Tool[]).map((t) => {
  const g = gateInfo.tools[t.slug]; if (!g) return { ...t, pricing: { ...t.pricing, verified: false, unverifiedReason: "never-verified" as const } };
  const india = t.pricing.india && g.inCheckedAt && !deadUrls.has(t.pricing.india.sourceUrl) ? { ...t.pricing.india, lastChecked: g.inCheckedAt } : undefined;
  return { ...t, pricing: { ...t.pricing, verified: g.verified, unverifiedReason: g.verified ? undefined : g.reason, lastChecked: g.checkedAt ?? t.pricing.lastChecked, india,
    extraSources: t.pricing.extraSources?.filter((u) => !deadUrls.has(u)) } };
});
export const site = siteJson as SiteConfig;
/** The brand is ONE setting (site.json "brand"): wordmark, titles, og images, schema, footer, llms.txt, /sponsor, /submit. */
export const BRAND = site.brand ?? "FindBetterAlt";
export const BRAND_HL = (site as SiteConfig & { brandHighlight?: string }).brandHighlight ?? "Alt";
export const BRAND_LEAD = BRAND.endsWith(BRAND_HL) ? BRAND.slice(0, -BRAND_HL.length) : BRAND;
export const people = ((db as unknown as { people?: Person[] }).people ?? []);
export const getPerson = (slug?: string) => people.find((p) => p.slug === slug);
// Alternatives may be plain slugs or { slug, why, bestFor } (Hermione's schema). Normalise once: `alternatives` = slugs, `meta` = per-slug info.
type RawAnchor = SchemaAnchor;
export type Anchor = Omit<SchemaAnchor, "alternatives"> & { alternatives: string[]; meta: Record<string, AnchorAlternative> };
export const anchors: Anchor[] = (db.anchors as unknown as RawAnchor[]).map((a) => {
  const meta: Record<string, AnchorAlternative> = {};
  const alternatives = a.alternatives.map((x) => { if (typeof x === "string") return x; meta[x.slug!] = x; return x.slug!; });
  return { ...a, alternatives, meta };
});
export const saas = db.saas as unknown as SchemaSaas[];
export const changes = ((db as unknown as { changes?: PriceChange[] }).changes ?? []);
/** Vendor price moves only. Corrections to our own data are never presented as vendor price changes. */
export const vendorChanges = changes.filter((c) => c.type === "vendor_change");
export const corrections = changes.filter((c) => c.type === "correction");
/** New tools added after the launch catalogue (17-18 Oct 2026), grouped by firstPublished date, newest first.
 *  Derived from tool data only, so /changes, its RSS feed and the tool pages never disagree. */
export const NEW_TOOLS_SINCE = "2026-10-19";
export const newToolBatches = [...new Set(tools.map((t) => t.firstPublished).filter((d): d is string => !!d && d >= NEW_TOOLS_SINCE))]
  .sort((a, b) => b.localeCompare(a)).map((date) => ({ date, id: `new-tools-${date}`, tools: tools.filter((t) => t.firstPublished === date) }));
export const stacks = db.stacks as unknown as SchemaStack[];
const bySlug = new Map(tools.map((t) => [t.slug, t]));
export const getTool = (s: string) => bySlug.get(s);
export const getAnchor = (s: string) => anchors.find((a) => a.slug === s);
export const altsOf = (s: string) => (getAnchor(s)?.alternatives ?? []).map((x) => bySlug.get(x)!).filter(Boolean);

export const isFree = (t: Tool) => t.tags.includes("free") || t.tags.includes("freemium") || t.pricing.hasFreePlan === true;
export const isOss = (t: Tool) => t.tags.includes("open source") && t.openSource?.licenseType === "open-source";
export const isSelf = (t: Tool) => t.tags.includes("self-hostable");

export const FILTERS = {
  free: { label: "Free", title: "Free alternatives", test: (t: Tool) => isFree(t) },
  "open-source": { label: "Open source", title: "Open-source alternatives", test: (t: Tool) => isOss(t) },
  "self-hosted": { label: "Self-hosted", title: "Self-hosted alternatives", test: (t: Tool) => isSelf(t) },
  cheaper: { label: "Cheaper", title: "Cheaper alternatives", test: (t: Tool, a?: Tool) =>
      (t.pricing.currency ?? "USD") === "USD" && (a?.pricing.currency ?? "USD") === "USD" && a?.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly < a.pricing.fromUsdMonthly },
} as const;
export type FilterKey = keyof typeof FILTERS;
export const filtered = (anchor: string, f: FilterKey) => {
  const a = getTool(anchor);
  return altsOf(anchor).filter((t) => FILTERS[f].test(t, a));
};
// Quality gate: only publish pages with at least 3 real data points
export const MIN = 3;
export const categories = () => {
  const m = new Map<string, number>();
  tools.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
export const fmtStars = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
