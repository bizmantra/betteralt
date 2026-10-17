// Unit tests for the badge rules in lib/picks.ts. Run: npx tsx scripts/test-picks.ts
import assert from "node:assert/strict";
import { picks, groupAlts } from "../src/lib/picks";
import type { Tool } from "../src/lib/data";
const mk = (slug: string, o: Partial<Tool["pricing"]> = {}, tags: string[] = [], oss?: number, licenseType: "open-source" | "fair-code" = "open-source"): Tool => ({ slug, name: slug.toUpperCase(), url: "", category: "", description: "", whoFor: "", tags: oss != null && licenseType === "open-source" ? [...tags, "open source"] : tags, status: "active",
  pricing: { summary: "x", fromUsdMonthly: null, hasFreePlan: false, verified: true, sourceUrl: "", lastChecked: "2026-10-18", currency: "USD", fromBilling: "monthly", ...o },
  openSource: oss != null ? { repo: "", stars: oss, license: "MIT", licenseType, archived: false, lastPush: "", setupDifficulty: 2 } : null } as Tool);
const by = (xs: Tool[]) => (s: string) => xs.find((x) => x.slug === s);
const k = (r: ReturnType<typeof picks>, kind: string) => r.find((p) => p.kind === kind)?.tool.slug;
const anchor = mk("anchor", { fromUsdMonthly: 20 }); // anchor billed monthly at $20
// 1) Best free = top pick with a $0 plan; budget = cheapest monthly price below the anchor's $20 monthly
let xs = [mk("sheets", { fromUsdMonthly: 7, hasFreePlan: true }), mk("rows", { fromUsdMonthly: 9, hasFreePlan: true }), mk("x", { fromUsdMonthly: 12 })];
let r = picks(xs, undefined, by(xs), anchor);
assert.equal(k(r, "free"), "sheets"); assert.equal(k(r, "budget"), "sheets", "a tool may hold two badges");
// 2) budget uses the anchor's basis only: an annual $3 doesn't count against a monthly anchor
xs = [mk("ann", { fromUsdMonthly: 3, fromBilling: "annual" }), mk("mon", { fromUsdMonthly: 5 }), mk("f", { hasFreePlan: true })];
r = picks(xs, undefined, by(xs), anchor); assert.equal(k(r, "budget"), "mon"); assert.match(r.find((p) => p.kind === "budget")!.criterion, /vs \$20\/mo billed monthly/);
// 3) nothing cheaper than the anchor → budget slot empty; anchor without a comparable price → empty
xs = [mk("dear", { fromUsdMonthly: 25 }), mk("f", { hasFreePlan: true }), mk("o", {}, [], 9)];
r = picks(xs, undefined, by(xs), anchor); assert.equal(k(r, "budget"), undefined);
r = picks([mk("c", { fromUsdMonthly: 1 }), mk("f", { hasFreePlan: true })], undefined, by([]), mk("free-anchor", { hasFreePlan: true })); assert.equal(k(r, "budget"), undefined);
// 4) unknown basis, non-USD, unverified: never budget; unverified never ranked or badged
xs = [mk("u", { fromUsdMonthly: 1, fromBilling: "unknown" }), mk("inr", { currency: "INR" }), mk("nv", { fromUsdMonthly: 2, verified: false, hasFreePlan: true }), mk("f", { hasFreePlan: true }), mk("o", {}, [], 9)];
r = picks(xs, undefined, by(xs), anchor); assert.equal(k(r, "budget"), undefined); assert.ok(!r.some((p) => p.tool.slug === "nv"));
const g = groupAlts(xs); assert.deepEqual(g.unverified.map((t) => t.slug), ["nv"]); assert.ok(!g.ranked.some((t) => t.slug === "nv"));
// 5) open source = OSI licence only; fair-code never wins
xs = [mk("fc", {}, [], 999, "fair-code"), mk("osi", {}, [], 5), mk("f", { hasFreePlan: true })];
r = picks(xs, undefined, by(xs), anchor); assert.equal(k(r, "openSource"), "osi");
// 6) editorial override: needs a reason + verified + the factual test; otherwise the rule decides
xs = [mk("a", { fromUsdMonthly: 3 }), mk("b", { hasFreePlan: true }), mk("c", { hasFreePlan: true }), mk("d", {}, [], 50), mk("e", { fromUsdMonthly: 8 })];
r = picks(xs, { bestFree: "c", pickReasons: { free: "Better for students" } }, by(xs), anchor); assert.equal(k(r, "free"), "c"); assert.ok(r.find((p) => p.kind === "free")!.editorial);
assert.equal(k(picks(xs, { bestFree: "c" }, by(xs), anchor), "free"), "b", "no reason → rule");
assert.equal(k(picks(xs, { bestFree: "a", pickReasons: { free: "x" } }, by(xs), anchor), "free"), "b", "no $0 plan → rule");
assert.equal(k(picks(xs, { bestOpenSource: "a", pickReasons: { openSource: "x" } }, by(xs), anchor), "openSource"), "d", "not OSI → rule");
assert.equal(k(picks(xs, { bestBudget: "b", pickReasons: { budget: "x" } }, by(xs), anchor), "budget"), "a", "no paid price → rule");
assert.equal(k(picks(xs, { bestBudget: "e", pickReasons: { budget: "Includes hosting" } }, by(xs), anchor), "budget"), "e", "eligible override");
assert.equal(k(picks(xs, { bestBudget: "e", pickReasons: { budget: "x" } }, by(xs), mk("cheap-anchor", { fromUsdMonthly: 5 })), "budget"), "a", "override must still be cheaper than the anchor");
r = picks(xs, { bestOverall: "a", bestBudget: "a", pickReasons: { overall: "Closest match", budget: "Cheapest" } }, by(xs), anchor);
assert.equal(k(r, "overall"), "a"); assert.equal(k(r, "budget"), "a", "same tool may hold overall and budget");
const nv = [...xs, mk("z", { verified: false, hasFreePlan: true })];
assert.notEqual(k(picks(nv, { bestFree: "z", pickReasons: { free: "x" } }, by(nv), anchor), "free"), "z", "unverified override refused");
// 7) fewer than two badges → hidden
assert.deepEqual(picks([mk("only", { fromUsdMonthly: 3 })], undefined, by([]), anchor).length, 0);
console.log("picks: all tests passed");
