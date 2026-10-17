import db from "../data/db.json";

import type { Tool as SchemaTool, Anchor as SchemaAnchor, AnchorAlternative, Saas as SchemaSaas, Stack as SchemaStack, Person, PriceChange, SiteConfig } from "./content-schema";
import siteJson from "../data/site.json";
export type { AnchorAlternative, Person, PriceChange, SiteConfig };
export type Tool = SchemaTool & { pricing: SchemaTool["pricing"] & { extraSources?: string[] } };
export const SITE = "https://findbetteralt.com";
export const CHECKED = "18 Oct 2026";
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; };
export const tools = db.tools as unknown as Tool[];
export const site = siteJson as SiteConfig;
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
export const stacks = db.stacks as unknown as SchemaStack[];
const bySlug = new Map(tools.map((t) => [t.slug, t]));
export const getTool = (s: string) => bySlug.get(s);
export const getAnchor = (s: string) => anchors.find((a) => a.slug === s);
export const altsOf = (s: string) => (getAnchor(s)?.alternatives ?? []).map((x) => bySlug.get(x)!).filter(Boolean);

export const isFree = (t: Tool) => t.tags.includes("free") || t.tags.includes("freemium") || t.pricing.hasFreePlan === true;
export const isOss = (t: Tool) => t.tags.includes("open source");
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
