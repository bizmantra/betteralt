// /prices.json: the verified prices roshan-kumar.com reads at build time.
// Run: npx tsx scripts/test-prices-json.ts
import assert from "node:assert/strict";

async function main() {
  const { GET } = await import("../src/app/prices.json/route");
  const res = await GET();
  assert.equal(res.status, 200);
  assert.match(res.headers.get("cache-control") ?? "", /max-age=3600/);
  const list = (await res.json()) as Record<string, unknown>[];
  assert.ok(list.length > 100, "most verified tools are listed");
  const keys = ["slug", "name", "url", "summary", "fromUsdMonthly", "hasFreePlan", "verified", "sourceUrl", "lastChecked"];
  for (const p of list) {
    assert.deepEqual(Object.keys(p).sort(), [...keys].sort(), `fields for ${p.slug}`);
    assert.equal(p.verified, true, `${p.slug} is verified`);
    assert.ok(p.sourceUrl && p.lastChecked, `${p.slug} has a source and a check date`);
  }
  const chatgpt = list.find((p) => p.slug === "chatgpt");
  assert.ok(chatgpt && chatgpt.sourceUrl && chatgpt.lastChecked);
  console.log(`prices.json: all tests passed (${list.length} tools)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
