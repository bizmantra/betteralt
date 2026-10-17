// Badge ("Best for") rules, defined once in code and enforced by scripts/validate-data.ts (Hermione, 18 Oct 02:39).
//  - Only active, verified tools can get a badge. Unverified tools are never badged or ranked.
//  - Best free: our top pick (pick order) that has a $0 plan (pricing.hasFreePlan === true).
//  - Best budget: the lowest verified paid USD starting price that is CHEAPER THAN THE ANCHOR on the SAME billing basis
//    (the anchor's own basis). No comparable anchor price, or nothing cheaper → no budget badge.
//  - Best open source: most GitHub stars among OSI-licensed tools (licenseType "open-source"), not archived.
//  - Best overall: editorial only.
//  - Editorial override for any badge: needs Verdict.best* + a written pickReasons[kind], a verified price, and the badge's
//    factual test above. It picks among eligible tools; it cannot override facts. Otherwise the rule decides.
//  - A tool MAY hold more than one badge. A slot with no eligible tool stays empty; we never force a weak tool in.
//  - Fewer than 2 badges → the Best-for list is hidden.
import type { Tool } from "./data";
import type { Verdict } from "./content-schema";

export type PickKind = "overall" | "budget" | "free" | "openSource";
export type Pick = { kind: PickKind; label: string; tool: Tool; criterion: string; editorial: boolean };
const LABEL: Record<PickKind, string> = { overall: "Best overall", budget: "Best budget", free: "Best free", openSource: "Best open source" };
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; };
export const isActive = (t: Tool) => !t.status || t.status === "active" || t.status === "renamed";
export const isVerified = (t: Tool) => t.pricing.verified === true && !!t.pricing.summary;
export const eligible = (t: Tool) => isActive(t) && isVerified(t);
export const hasZeroPlan = (t: Tool) => t.pricing.hasFreePlan === true;
export const paidUsd = (t: Tool) => (t.pricing.currency === "USD" && t.pricing.fromUsdMonthly != null && t.pricing.fromUsdMonthly > 0 && (t.pricing.fromBilling === "monthly" || t.pricing.fromBilling === "annual") ? t.pricing.fromUsdMonthly : null);
export const isOsiOpenSource = (t: Tool) => !!t.openSource && t.openSource.licenseType === "open-source" && t.tags.includes("open source");

/** Budget candidates: verified paid USD prices on the anchor's billing basis, cheaper than the anchor. */
export function budgetCandidates(pool: Tool[], anchor?: Tool) {
  const ap = anchor ? paidUsd(anchor) : null;
  if (!anchor || ap == null) return { basis: null as "monthly" | "annual" | null, anchorPrice: null as number | null, list: [] as Tool[] };
  const basis = anchor.pricing.fromBilling as "monthly" | "annual";
  const list = pool.filter((t) => t !== anchor && paidUsd(t) != null && t.pricing.fromBilling === basis && paidUsd(t)! < ap).map((t, i) => ({ t, i })).sort((a, b) => paidUsd(a.t)! - paidUsd(b.t)! || a.i - b.i).map((x) => x.t);
  return { basis, anchorPrice: ap, list };
}

const FIELD: Record<PickKind, "bestOverall" | "bestBudget" | "bestFree" | "bestOpenSource"> = { overall: "bestOverall", budget: "bestBudget", free: "bestFree", openSource: "bestOpenSource" };
/** Factual eligibility for each badge, given the remaining pool. Editorial overrides must pass this too. */
export function qualifies(kind: PickKind, t: Tool, pool: Tool[], anchor?: Tool) {
  if (!eligible(t)) return false;
  if (kind === "free") return hasZeroPlan(t);
  if (kind === "budget") return budgetCandidates(pool, anchor).list.includes(t);
  if (kind === "openSource") return isOsiOpenSource(t) && !t.openSource!.archived;
  return true;
}
/** Editorial override (Hermione, 18 Oct): allowed for every badge, but only with a written pickReasons entry, a verified
 *  price and the badge's factual eligibility. It picks among eligible tools; it cannot override facts. Otherwise the rule decides. */
export function override(kind: PickKind, verdict: Verdict | undefined, byslug: (s: string) => Tool | undefined, pool: Tool[], anchor?: Tool) {
  const slug = verdict?.[FIELD[kind]] as string | undefined, why = verdict?.pickReasons?.[kind];
  const t = slug ? byslug(slug) : undefined;
  return t && why && pool.includes(t) && qualifies(kind, t, pool, anchor) ? { t, why } : null;
}

export function picks(alts: Tool[], verdict: Verdict | undefined, byslug: (s: string) => Tool | undefined, anchor?: Tool): Pick[] {
  const out: Pick[] = [];
  const pool = alts.filter(eligible);
  const add = (kind: PickKind, t: Tool | undefined, criterion: string, editorial = false) => { if (t) out.push({ kind, label: LABEL[kind], tool: t, criterion, editorial }); };
  const ed = (kind: PickKind) => { const o = override(kind, verdict, byslug, pool, anchor); if (o) add(kind, o.t, o.why, true); return !!o; };
  ed("overall"); // no rule-based "overall"
  if (!ed("free")) { const f = pool.find(hasZeroPlan); if (f) add("free", f, `Our top pick with a $0 plan (checked ${fmt(f.pricing.lastChecked)})`); }
  if (!ed("budget")) {
    const { basis, anchorPrice, list } = budgetCandidates(pool, anchor); const b = list[0];
    if (b && basis) { const tie = list.find((r) => r !== b && paidUsd(r) === paidUsd(b)); const bw = basis === "monthly" ? "monthly" : "annually";
      add("budget", b, `Lowest paid starting price here: $${paidUsd(b)}/mo billed ${bw}, vs $${anchorPrice}/mo billed ${bw} for ${anchor!.name} (checked ${fmt(b.pricing.lastChecked)})${tie ? `, tied with ${tie.name}` : ""}`); }
  }
  if (!ed("openSource")) {
    const oss = pool.filter((t) => qualifies("openSource", t, pool)).sort((a, b) => b.openSource!.stars - a.openSource!.stars)[0];
    if (oss) add("openSource", oss, `Most GitHub stars (${(oss.openSource!.stars / 1000).toFixed(1)}k) of the OSI-licensed options (${oss.openSource!.license})${oss.openSource!.setupDifficulty ? ` · setup ${oss.openSource!.setupDifficulty}/5` : ""}`);
  }
  const ord: PickKind[] = ["overall", "budget", "free", "openSource"];
  out.sort((a, b) => ord.indexOf(a.kind) - ord.indexOf(b.kind));
  return out.length >= 2 ? out : [];
}

// Listing groups: only active + verified tools are ranked (numbered, badged, in ItemList schema).
export function groupAlts(items: Tool[]) {
  return {
    ranked: items.filter(eligible),
    unverified: items.filter((t) => isActive(t) && !isVerified(t)),
    gone: items.filter((t) => !isActive(t)),
  };
}
