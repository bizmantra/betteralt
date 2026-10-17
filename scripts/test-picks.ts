// Unit test for lib/picks.ts: ties, collisions, missing candidates, editorial picks without reasons. Run: npx tsx scripts/test-picks.ts
import assert from "node:assert/strict";
import { picks } from "../src/lib/picks";
import type { Tool } from "../src/lib/data";
const mk = (slug: string, o: Partial<Tool["pricing"]> = {}, tags: string[] = [], oss?: number): Tool => ({ slug, name: slug.toUpperCase(), url: "", category: "", description: "", whoFor: "", tags,
  pricing: { summary: "x", fromUsdMonthly: null, hasFreePlan: false, verified: true, sourceUrl: "", lastChecked: "2026-10-18", currency: "USD", ...o },
  openSource: oss != null ? { repo: "", stars: oss, license: "MIT", archived: false, lastPush: "", setupDifficulty: 2 } : null } as Tool);
const by = (xs: Tool[]) => (s: string) => xs.find((x) => x.slug === s);
// tie on budget
let xs = [mk("a", { fromUsdMonthly: 5 }), mk("b", { fromUsdMonthly: 5, hasFreePlan: true }), mk("c", {}, ["open source"], 100)];
let r = picks(xs, undefined, by(xs));
assert.equal(r.find((p) => p.kind === "budget")!.tool.slug, "a"); assert.match(r.find((p) => p.kind === "budget")!.criterion, /tied with B/);
// collision: b is free and next; free pick must not reuse a
assert.equal(r.find((p) => p.kind === "free")!.tool.slug, "b");
assert.equal(r.find((p) => p.kind === "openSource")!.tool.slug, "c");
assert.equal(r.some((p) => p.kind === "overall"), false, "no derived overall");
// collision: the only free tool is also the budget pick → free pick skipped
xs = [mk("a", { fromUsdMonthly: 3, hasFreePlan: true }), mk("z", { fromUsdMonthly: 9 })];
r = picks(xs, undefined, by(xs)); assert.deepEqual(r.map((p) => p.kind), []); // only 1 item → hidden
// editorial without a reason is not rendered, and does not fall back
xs = [mk("a", { fromUsdMonthly: 3 }), mk("b", { hasFreePlan: true }), mk("c", {}, ["open source"], 5)];
r = picks(xs, { bestBudget: "a" }, by(xs)); assert.equal(r.some((p) => p.kind === "budget"), false);
r = picks(xs, { bestBudget: "a", bestOverall: "c", pickReasons: { budget: "Cheapest paid plan", overall: "Closest match" } }, by(xs));
assert.equal(r[0].kind, "overall"); assert.equal(r[0].editorial, true); assert.equal(r.find((p) => p.kind === "openSource"), undefined, "c used once");
// unverified / non-USD never budget
xs = [mk("a", { fromUsdMonthly: 1, verified: false }), mk("b", { fromUsdMonthly: 2, currency: "INR" }), mk("c", { hasFreePlan: true }), mk("d", {}, ["open source"], 9)];
r = picks(xs, undefined, by(xs)); assert.equal(r.some((p) => p.kind === "budget"), false);
console.log("picks: all tests passed");
