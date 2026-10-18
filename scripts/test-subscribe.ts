// Tests for the newsletter double opt-in (src/lib/subscribe.ts + /api/subscribe routes), with Resend mocked.
// Run: npx tsx scripts/test-subscribe.ts
import assert from "node:assert/strict";
process.env.RESEND_API_KEY = "re_test_dummy_key_for_unit_tests_only"; process.env.RESEND_SEGMENT_ID = "seg-test"; delete process.env.SUBSCRIBE_TOKEN_SECRET; delete process.env.VERCEL;
type Call = { method: string; path: string; body?: Record<string, unknown> };
type C = { email: string; unsubscribed: boolean; properties: Record<string, { value: string; type: string }> };
const store = new Map<string, C>(); let calls: Call[] = []; let throttleNext = 0;
globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
  const u = new URL(String(url)), method = init?.method ?? "GET", body = init?.body ? JSON.parse(String(init.body)) : undefined;
  const path = u.pathname; calls.push({ method, path, body });
  const res = (j: object, status = 200) => new Response(JSON.stringify(j), { status, headers: { "content-type": "application/json" } });
  if (path.startsWith("/domains/")) return res({ status: "verified" });
  if (path === "/contact-properties") { if (method === "GET") return res({ data: [{ key: "signup_source" }, { key: "utm_source" }] }); return res({ id: "p" }); }
  if (throttleNext > 0) { throttleNext--; return res({ name: "rate_limit_exceeded" }, 429); }
  if (path === "/emails") return res({ id: "em_" + calls.length });
  if (path === "/contacts" && method === "POST") { const props = Object.fromEntries(Object.entries(body.properties ?? {}).map(([k, v]) => [k, { value: String(v), type: "string" }])); store.set(body.email, { email: body.email, unsubscribed: body.unsubscribed ?? false, properties: props }); return res({ id: "c" }); }
  const m = path.match(/^\/contacts\/([^/]+)(\/segments\/(.+))?$/);
  if (m) { const e = decodeURIComponent(m[1]), c = store.get(e);
    if (m[2]) return c ? res({ id: "s" }) : res({ message: "not found" }, 404);
    if (method === "GET") return c ? res({ object: "contact", email: e, unsubscribed: c.unsubscribed, properties: c.properties }) : res({ message: "Contact not found" }, 404);
    if (method === "PATCH") { if (!c) return res({}, 404); if ("unsubscribed" in body) c.unsubscribed = body.unsubscribed; for (const [k, v] of Object.entries(body.properties ?? {})) c.properties[k] = { value: String(v), type: "string" }; return res({ id: "c" }); }
    if (method === "DELETE") { store.delete(e); return res({ deleted: true }); } }
  return res({ message: "unexpected " + method + " " + path }, 500);
}) as typeof fetch;

async function main() {
const L = await import("../src/lib/subscribe");
const sub = await import("../src/app/api/subscribe/route");
const conf = await import("../src/app/api/subscribe/confirm/route");
const uns = await import("../src/app/api/subscribe/unsubscribe/route");
const post = (h: { POST: (r: Request) => Promise<Response> }, body: object, path = "/api/subscribe") => (L.resetRateLimits(), h.POST)(new Request("https://findbetteralt.com" + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).then(async (r) => ({ status: r.status, j: await r.json() }));
const sent = (type: string) => calls.filter((c) => c.path === "/emails" && (c.body?.tags as { value: string }[])?.[0]?.value === type);
const formToken = (ageMs = 5000) => L.signToken({ p: "form", iat: Date.now() - ageMs, exp: Date.now() + 3600e3 });
const linkToken = (html: string, kind: "confirm" | "unsubscribe") => decodeURIComponent(html.match(new RegExp(`/newsletter/${kind}\\?t=([^"&\\s]+)`))![1]);

// --- tokens ---
const k = L.signingKey()!; assert.equal(k.length, 32); assert.ok(!k.toString("hex").includes(Buffer.from(process.env.RESEND_API_KEY!).toString("hex")), "derived key is not the API key");
const t = L.signToken({ p: "confirm", e: "a@b.co", iat: 1, exp: Date.now() + 1000 });
assert.equal(L.verifyToken(t, "confirm")?.e, "a@b.co");
assert.equal(L.verifyToken(t, "unsub"), null, "purpose is bound");
assert.equal(L.verifyToken(t.slice(0, -2) + "xx", "confirm"), null, "tampered signature");
const [p, s] = t.split("."); const forged = Buffer.from(JSON.stringify({ p: "confirm", e: "victim@x.co", iat: 1 })).toString("base64url");
assert.equal(L.verifyToken(`${forged}.${s}`, "confirm"), null, "payload swap");
assert.equal(L.verifyToken(L.signToken({ p: "confirm", e: "a@b.co", iat: 1, exp: Date.now() - 1 }), "confirm"), null, "expired");
assert.equal(L.verifyToken(p, "confirm"), null); assert.equal(L.verifyToken(undefined, "confirm"), null);
// --- trusted IP ---
const h = new Headers({ "x-forwarded-for": "6.6.6.6, 1.1.1.1", "x-vercel-forwarded-for": "2.2.2.2", "x-real-ip": "3.3.3.3" });
assert.equal(L.clientIp(h, true), "2.2.2.2"); assert.equal(L.clientIp(new Headers({ "x-real-ip": "3.3.3.3", "x-forwarded-for": "6.6.6.6" }), true), "3.3.3.3");
assert.equal(L.clientIp(h, false), "local", "off Vercel nothing is trusted");
// --- state rules ---
const mk = (unsub: boolean, props: Record<string, string>) => ({ email: "x@y.co", unsubscribed: unsub, props });
assert.equal(L.existingAction(mk(true, { signup_status: "unsubscribed" })), "none");
assert.equal(L.existingAction(mk(true, {})), "none", "legacy opted-out contact untouched");
assert.equal(L.existingAction(mk(false, {})), "none"); assert.equal(L.existingAction(mk(false, { signup_status: "confirmed" })), "none");
assert.equal(L.existingAction(mk(true, { signup_status: "pending", confirm_sent_at: new Date().toISOString() })), "throttled");
assert.equal(L.existingAction(mk(true, { signup_status: "pending", confirm_sent_at: new Date(Date.now() - 11 * 60e3).toISOString() })), "resend-confirm");
assert.ok(!L.canConfirm(mk(true, { signup_status: "unsubscribed" })) && !L.canConfirm(mk(true, {})) && !L.canConfirm(null) && L.canConfirm(mk(true, { signup_status: "pending" })));
assert.deepEqual(L.flattenProps({ a: { value: "1", type: "string" }, b: "2", c: null }), { a: "1", b: "2" });
// --- emails use the brand from site config ---
assert.match(L.welcomeEmail("u").html, /FindBetterAlt/); assert.doesNotMatch(L.welcomeEmail("u").html, /Better<span/); assert.match(L.confirmEmail("c").subject, /FindBetterAlt/);

// --- end to end through the routes ---
const email = "new@example.com", attribution = { utm_source: "hn", referrer_host: "news.ycombinator.com" };
// bots: honeypot, missing form token, too fast → nothing created
assert.equal((await post(sub, { email, company: "x", ft: formToken() })).j.ok, true);
assert.equal((await post(sub, { email })).status, 400, "no form token");
assert.equal((await post(sub, { email, ft: formToken(100) })).j.ok, true); assert.equal(store.size, 0, "bots create nothing");
// signup → pending contact (unsubscribed, no segment), one confirmation email, attribution kept
calls = []; let r = await post(sub, { email, source: "alternatives/cursor", attribution, ft: formToken() });
assert.equal(r.j.message, L.NEUTRAL);
assert.equal(calls.filter((x) => x.path === "/contact-properties" && x.method === "POST").length, 7, "only missing properties are created");
let c = store.get(email)!; assert.equal(c.unsubscribed, true, "pending is not subscribed"); assert.equal(c.properties.signup_status.value, "pending");
assert.equal(c.properties.utm_source.value, "hn"); assert.equal(c.properties.signup_source.value, "alternatives/cursor");
assert.ok(!calls.some((x) => x.path.includes("/segments/")), "not in the segment yet"); assert.equal(sent("confirm").length, 1); assert.equal(sent("welcome").length, 0);
const ct = linkToken(String(sent("confirm")[0].body!.html), "confirm");
// resubmit while pending → throttled, same neutral answer
calls = []; r = await post(sub, { email, ft: formToken() }); assert.equal(r.j.message, L.NEUTRAL); assert.equal(sent("confirm").length, 0);
// bad / wrong-purpose token can't confirm
assert.equal((await post(conf, { t: "x.y" }, "/api/subscribe/confirm")).status, 400);
assert.equal((await post(conf, { t: L.signToken({ p: "unsub", e: email, iat: 1 }) }, "/api/subscribe/confirm")).status, 400);
// confirm → subscribed, in segment, welcome with unsubscribe link + List-Unsubscribe headers
calls = []; r = await post(conf, { t: ct }, "/api/subscribe/confirm"); assert.equal(r.j.ok, true);
c = store.get(email)!; assert.equal(c.unsubscribed, false); assert.equal(c.properties.signup_status.value, "confirmed");
assert.ok(calls.some((x) => x.path === `/contacts/${encodeURIComponent(email)}/segments/seg-test`)); assert.equal(sent("welcome").length, 1);
const w = sent("welcome")[0].body!; assert.match(String(w.html), /FindBetterAlt/); assert.match(String((w.headers as Record<string, string>)["List-Unsubscribe"]), /\/api\/subscribe\/unsubscribe\?t=/);
const ut = linkToken(String(w.html), "unsubscribe");
// confirming twice doesn't send a second welcome
calls = []; r = await post(conf, { t: ct }, "/api/subscribe/confirm"); assert.equal(r.j.ok, true); assert.equal(sent("welcome").length, 0);
// unsubscribe → opted out; resubmit and old confirm link both change nothing and send nothing
assert.equal((await post(uns, { t: ut }, "/api/subscribe/unsubscribe")).j.ok, true);
c = store.get(email)!; assert.equal(c.unsubscribed, true); assert.equal(c.properties.signup_status.value, "unsubscribed");
calls = []; r = await post(sub, { email, ft: formToken() }); assert.equal(r.j.message, L.NEUTRAL, "neutral reply");
assert.ok(!calls.some((x) => x.method === "PATCH" || x.path === "/emails" || x.path.includes("/segments/")), "no resubscribe, no email");
assert.equal(store.get(email)!.unsubscribed, true);
r = await post(conf, { t: ct }, "/api/subscribe/confirm"); assert.equal(r.status, 400, "old confirm link can't resubscribe"); assert.equal(store.get(email)!.unsubscribed, true);
// legacy opted-out contact (no status) is never touched
store.set("old@example.com", { email: "old@example.com", unsubscribed: true, properties: {} }); calls = [];
await post(sub, { email: "old@example.com", ft: formToken() }); assert.ok(!calls.some((x) => x.method !== "GET")); assert.equal(store.get("old@example.com")!.unsubscribed, true);
// erase → contact deleted
assert.equal((await post(uns, { t: ut, erase: true }, "/api/subscribe/unsubscribe")).j.ok, true); assert.equal(store.has(email), false);
// one-click unsubscribe (RFC 8058): token in the query, form body
store.set("oc@example.com", { email: "oc@example.com", unsubscribed: false, properties: { signup_status: { value: "confirmed", type: "string" } } });
const oc = L.signToken({ p: "unsub", e: "oc@example.com", iat: Date.now() });
const ocr = await uns.POST(new Request(`https://findbetteralt.com/api/subscribe/unsubscribe?t=${encodeURIComponent(oc)}`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" }));
assert.equal(ocr.status, 200); assert.equal(store.get("oc@example.com")!.unsubscribed, true);
// rate limit: the 6th signup attempt in 10 minutes from one IP gets 429
L.resetRateLimits(); const codes: number[] = [];
for (let i = 0; i < 6; i++) codes.push((await sub.POST(new Request("https://findbetteralt.com/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "rl@example.com", company: "bot" }) }))).status);
assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
// Resend 429 (10 req/s) is retried
throttleNext = 2; assert.equal((await L.resend("k", "/contacts/" + encodeURIComponent("oc@example.com"), undefined, "GET")).status, 200);
throttleNext = 3; assert.equal((await L.resend("k", "/contacts/" + encodeURIComponent("oc@example.com"), undefined, "GET")).status, 429, "gives up after two retries");
// form token endpoint
const g = sub.GET(new Request("https://findbetteralt.com/api/subscribe")); assert.ok(L.verifyToken((await g.json()).ft, "form"));
console.log("subscribe: all tests passed");
}
main().catch((e) => { console.error(e); process.exit(1); });
