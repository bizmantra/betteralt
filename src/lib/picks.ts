// "Best for" picks (Neville P0-3). Pure, build-time. Editorial picks need a reason (Verdict.pickReasons), otherwise
// that pick isn't rendered. Derived picks state the rule that produced them. Affiliate/sponsor status never matters.
import type { Tool } from "./data";
import type { Verdict } from "./content-schema";

export type PickKind = "overall" | "budget" | "free" | "openSource";
export type Pick = { kind: PickKind; label: string; tool: Tool; criterion: string; editorial: boolean };
const LABEL: Record<PickKind, string> = { overall: "Best overall", budget: "Best budget", free: "Best free", openSource: "Best open source" };
const FIELD: Record<PickKind, keyof Verdict> = { overall: "bestOverall", budget: "bestBudget", free: "bestFree", openSource: "bestOpenSource" };
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; };
const active = (t: Tool) => !t.status || t.status === "active" || t.status === "renamed";
const isFree = (t: Tool) => t.tags.includes("free") || t.tags.includes("freemium") || t.pricing.hasFreePlan === true;
const usd = (t: Tool) => ((t.pricing.currency ?? "USD") === "USD" && t.pricing.verified && t.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly > 0 ? t.pricing.fromUsdMonthly : null);

export function picks(alts: Tool[], verdict: Verdict | undefined, byslug: (s: string) => Tool | undefined): Pick[] {
  const used = new Set<string>(); const out: Pick[] = [];
  const take = (kind: PickKind, candidates: Tool[], criterion: (t: Tool, rest: Tool[]) => string) => {
    const ed = verdict?.[FIELD[kind]] as string | undefined;
    if (ed) { // editorial pick wins; without a reason it is not rendered (and no fallback replaces it)
      const t = byslug(ed), why = verdict?.pickReasons?.[kind];
      if (t && why && !used.has(t.slug)) { used.add(t.slug); out.push({ kind, label: LABEL[kind], tool: t, criterion: why, editorial: true }); }
      return;
    }
    const free = candidates.filter((t) => !used.has(t.slug));
    if (!free.length) return;
    const t = free[0]; used.add(t.slug);
    out.push({ kind, label: LABEL[kind], tool: t, criterion: criterion(t, free.slice(1)), editorial: false });
  };
  const pool = alts.filter(active);
  take("overall", [], () => ""); // no derived "overall": editorial only
  const priced = pool.filter((t) => usd(t) != null).sort((a, b) => usd(a)! - usd(b)!);
  take("budget", priced, (t, rest) => {
    const tie = rest.find((r) => usd(r) === usd(t));
    return `Lowest starting price listed on the vendors' pricing pages (checked ${fmt(t.pricing.lastChecked)})${tie ? `, tied with ${tie.name}` : ""}`;
  });
  take("free", pool.filter(isFree), () => "Free plan available");
  const oss = pool.filter((t) => t.openSource && !t.openSource.archived && t.tags.includes("open source")).sort((a, b) => b.openSource!.stars - a.openSource!.stars);
  take("openSource", oss, (t) => `Most GitHub stars (${(t.openSource!.stars / 1000).toFixed(1)}k) of the open-source options${t.openSource!.setupDifficulty ? ` · setup ${t.openSource!.setupDifficulty}/5` : ""}`);
  return out.length >= 2 ? out : [];
}
