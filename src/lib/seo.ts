// Single source of truth for which pages are indexable, which 308, and each page's real lastmod.
// Imported by next.config.ts (redirects), sitemap.ts, generateStaticParams and metadata, so keep imports relative.
import { anchors, saas, stacks, tools, getTool, altsOf, filtered, FILTERS, MIN, changes, type FilterKey, type Tool } from "./data";
import db from "../data/db.json";

const FKEYS = Object.keys(FILTERS) as FilterKey[];
const filterIntros = (slug: string) =>
  ((db.anchors as { slug: string; filterIntros?: Partial<Record<FilterKey, string>> }[]).find((a) => a.slug === slug)?.filterIntros ?? {});
const set = (xs: Tool[]) => new Set(xs.map((t) => t.slug));
const jaccard = (a: Set<string>, b: Set<string>) => { let i = 0; a.forEach((x) => { if (b.has(x)) i++; }); return i / (a.size + b.size - i || 1); };
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export const saasRedirect = (slug: string) => saas.find((s) => s.slug === slug)?.redirectTo ?? null;
export const indexableSaas = () => saas.filter((s) => !s.redirectTo);
export const indexableAnchors = () => anchors.filter((a) => altsOf(a.slug).length >= MIN);

type Variant = { tool: string; filter: FilterKey; items: Tool[]; reason?: string };
let cache: { ok: Variant[]; failed: Variant[] } | null = null;
// Spec §1: a filter variant is indexable only if ALL rules hold. Otherwise it 308s to its parent (if it was ever live).
export function variants() {
  if (cache) return cache;
  const ok: Variant[] = [], failed: Variant[] = [];
  const others: Set<string>[] = [...indexableAnchors().map((a) => set(altsOf(a.slug))), ...indexableSaas().map((s) => new Set(s.alternatives))];
  for (const a of anchors) for (const f of FKEYS) {
    const items = filtered(a.slug, f), parent = altsOf(a.slug), s = set(items);
    if (items.length < MIN) continue; // never generated, nothing to redirect
    let reason = "";
    if (!items.every((t) => t.pricing.verified)) reason = "unverified item";
    else if (s.size === parent.length) reason = "same as parent";
    else if (items.length > parent.length - 2) reason = "removes fewer than 2 tools";
    else if (f === "cheaper" && !(getTool(a.slug)?.pricing.fromUsdMonthly != null && (getTool(a.slug)?.pricing.currency ?? "USD") === "USD")) reason = "anchor has no USD price";
    else if (!filterIntros(a.slug)[f] || wordCount(filterIntros(a.slug)[f]!) < 40 || wordCount(filterIntros(a.slug)[f]!) > 80) reason = "no approved filter intro";
    else if ([...others, ...ok.map((v) => set(v.items))].some((o) => jaccard(s, o) >= 0.8)) reason = "Jaccard >= 0.8 with another page";
    (reason ? failed : ok).push({ tool: a.slug, filter: f, items, reason: reason || undefined });
  }
  return (cache = { ok, failed });
}
export const isIndexableVariant = (tool: string, filter: string) => variants().ok.some((v) => v.tool === tool && v.filter === filter);

export function seoRedirects() {
  return [
    ...variants().failed.map((v) => ({ source: `/alternatives/${v.tool}/${v.filter}`, destination: `/alternatives/${v.tool}`, permanent: true })),
    ...saas.filter((s) => s.redirectTo).map((s) => ({ source: `/ai-alternative-to/${s.slug}`, destination: s.redirectTo!, permanent: true })),
  ];
}

// ---- real lastmod: change dates, never check dates or build time ----
const maxDate = (...ds: (string | undefined | null)[]) => ds.filter(Boolean).sort().at(-1) ?? "2026-10-18";
const toolChanged = (t?: Tool) => (t ? maxDate(t.contentUpdatedAt, t.pricing.lastChangedAt) : undefined);
export const lastmodTool = (slug: string) => toolChanged(getTool(slug))!;
export const lastmodAnchor = (slug: string) => maxDate(anchors.find((a) => a.slug === slug)?.contentUpdatedAt, toolChanged(getTool(slug)), ...altsOf(slug).map(toolChanged));
export const lastmodVariant = (slug: string, f: FilterKey) => maxDate(anchors.find((a) => a.slug === slug)?.contentUpdatedAt, toolChanged(getTool(slug)), ...filtered(slug, f).map(toolChanged));
export const lastmodSaas = (slug: string) => { const s = saas.find((x) => x.slug === slug)!; return maxDate(s.contentUpdatedAt, ...s.alternatives.map((x) => toolChanged(getTool(x)))); };
export const lastmodStack = (slug: string) => { const s = stacks.find((x) => x.slug === slug)!; return maxDate(s.contentUpdatedAt, ...s.items.map((i) => toolChanged(getTool(i.tool)))); };
// Static pages: date of the last content edit of that page (from git history of the page file)
export const STATIC_LASTMOD: Record<string, string> = { "/about": "2026-10-18", "/submit": "2026-10-18", "/sponsor": "2026-10-18", "/privacy": "2026-10-18", "/terms": "2026-10-18", "/newsletter": "2026-10-18" };
export const lastmodOpenSource = () => maxDate(...tools.filter((t) => t.tags.includes("open source")).map(toolChanged));
export const lastmodChanges = () => maxDate(...changes.map((c) => c.date));
export const lastmodStacks = () => maxDate(...stacks.map((s) => lastmodStack(s.slug)));
export const lastmodHome = () => maxDate(...anchors.map((a) => lastmodAnchor(a.slug)));
export const monthYear = (iso: string) => { const d = new Date(iso + "T00:00:00Z"); return d.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }); };

export function indexableCounts() {
  return { home: 1, alternatives: indexableAnchors().length, filterVariants: variants().ok.length, filterVariantsRedirected: variants().failed.length,
    aiAlternativeTo: indexableSaas().length, aiAlternativeToRedirected: saas.length - indexableSaas().length, tools: tools.length, stacks: stacks.length };
}
