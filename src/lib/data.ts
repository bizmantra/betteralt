import db from "@/data/db.json";

export type Tool = {
  slug: string; name: string; url: string; category: string; description: string; whoFor: string; tags: string[];
  pricing: { summary: string | null; fromUsdMonthly: number | null; hasFreePlan: boolean | null; verified: boolean; sourceUrl: string; lastChecked: string };
  openSource: { repo: string; stars: number; license: string; archived: boolean; lastPush: string; setupDifficulty: number | null } | null;
};
export const SITE = "https://findbetteralt.com";
export const CHECKED = "17 Oct 2026";
export const tools = db.tools as Tool[];
export const anchors = db.anchors as { slug: string; alternatives: string[] }[];
export const saas = db.saas as { slug: string; name: string; toolSlug: string; alternatives: string[] }[];
export const stacks = db.stacks as { slug: string; title: string; intro: string; items: { tool: string; role: string }[] }[];
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
      a?.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly < a.pricing.fromUsdMonthly },
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
