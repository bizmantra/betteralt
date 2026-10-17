/**
 * Deterministic pricing-page snapshots. No LLM anywhere in this step.
 *   npx tsx scripts/snapshot.ts            # every tool (US + India sources)
 *   npx tsx scripts/snapshot.ts cursor n8n # only these slugs
 *   npx tsx scripts/snapshot.ts --stale    # only sources whose newest snapshot is >= 3 days old (Mon/Thu watch)
 * 1) plain fetch with US headers (Accept-Language en-US, US geo params where the vendor supports them);
 * 2) if the text is too short or lacks the expected currency symbol, headless Chrome via playwright-core
 *    (locale en-US, timezone America/New_York) and save document.body.innerText.
 * Output: data/snapshots/{slug}/{YYYY-MM-DD}.txt (US) or {YYYY-MM-DD}.in.txt (India line), plus a JSON header line.
 * A snapshot that is still too short / has no currency symbol is NOT saved; the slug is listed as failed (exit 1).
 */
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
type Pricing = { summary?: string | null; sourceUrl?: string; extraSources?: string[]; currency?: string; verified?: boolean; india?: { sourceUrl?: string } };
type T = { slug: string; pricing: Pricing };
const ROOT = path.resolve(__dirname, ".."), OUT = path.join(ROOT, "data/snapshots");
export const MIN_CHARS = 400;
export const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", Accept: "text/html,application/xhtml+xml" };
// Vendors that honour an explicit region/currency parameter (only ones we have seen work).
const GEO: Record<string, (u: URL) => void> = {
  "www.shopify.com": () => {},
};
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/** Structured data the vendor publishes on the page (e.g. FAQPage answers hidden behind accordions), kept verbatim. */
export function jsonLd(html: string) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim()).filter(Boolean);
}
export function htmlToText(html: string) {
  return html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|td|th|section|article|span|a|button)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#36;/g, "$").replace(/&euro;/g, "€").replace(/&#8377;/g, "₹")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}
const amounts = (t: string, sym: string) => { const e = sym === "$" ? "\\$" : sym; return (t.match(new RegExp(`${e}\\s?\\d|\\d\\s?${e}`, "g")) ?? []).length; };
/** Passes when long enough and, if a currency is expected, that currency's amounts are on the page and outnumber
 *  amounts in other currencies (a US page that is mostly ₹ means the vendor localised it to our IP: not a US price). */
const ok = (t: string, sym: string) => {
  if (t.length < MIN_CHARS) return false;
  if (!sym) return true;
  const mine = amounts(t, sym), other = ["$", "€", "£", "₹"].filter((x) => x !== sym).reduce((n, x) => n + amounts(t, x), 0);
  return mine > 0 && mine >= other;
};
// Static HTML with fewer than 3 amounts usually means prices are rendered client-side: use the browser.
const thin = (t: string) => (t.match(/[$€£₹]\s?\d|\d\s?[€£₹]/g) ?? []).length < 3;
// The page must show the currency symbol whenever our stored price has an amount in that currency (or the price is still unverified,
// in which case we expect a USD page). Free/open-source tools whose source is a repo page carry no amounts and need no symbol.
export const expectSymbol = (summary: string | null | undefined, currency: string) => (!summary || /[$€£₹]\s?\d/.test(summary) ? (SYMBOL[currency] ?? "$") : "");

async function viaFetch(url: string) {
  const r = await fetch(url, { headers: HEADERS, redirect: "follow", signal: AbortSignal.timeout(20000) });
  const html = r.ok ? await r.text() : "";
  return { status: r.status, finalUrl: r.url, text: html ? htmlToText(html) : "", ld: jsonLd(html) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browser: any = null;
async function viaBrowser(url: string, region: "us" | "in") {
  const { chromium } = await import("playwright-core");
  browser ??= await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", headless: true });
  const ctx = await browser.newContext(region === "us"
    ? { locale: "en-US", timezoneId: "America/New_York", userAgent: UA, extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" }, geolocation: { latitude: 40.7128, longitude: -74.006 }, permissions: ["geolocation"] }
    : { locale: "en-IN", timezoneId: "Asia/Kolkata", userAgent: UA });
  const pg = await ctx.newPage();
  try {
    const resp = await pg.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await pg.waitForTimeout(6000);
    // dismiss a cookie wall if one blocks the content (first matching button only)
    try { const b = pg.getByRole("button", { name: /^(accept all|accept|allow all|i agree|agree|got it)$/i }).first(); if (await b.count()) { await b.click({ timeout: 3000 }); await pg.waitForTimeout(2500); } } catch { /* none */ }
    // lazy-rendered pricing tables: scroll through the page once, then settle
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } window.scrollTo(0, 0); });
    await pg.waitForTimeout(3000);
    return { status: resp?.status() ?? 0, finalUrl: pg.url(), text: ((await pg.innerText("body")) as string).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim(), ld: jsonLd(await pg.content()) };
  } finally { await ctx.close(); }
}

export async function snapshot(slug: string, url: string, currency: string, region: "us" | "in", sym: string, suffix = "") {
  const u = new URL(url); GEO[u.host]?.(u);
  let method = "fetch", res: { status: number; finalUrl: string; text: string; ld?: string[] } = { status: 0, finalUrl: url, text: "" };
  try { res = await viaFetch(u.toString()); } catch { /* fall through to browser */ }
  if (!ok(res.text, sym) || (sym && thin(res.text)) || region === "in") { method = "playwright"; try { res = await viaBrowser(u.toString(), region); } catch (e) { res = { status: 0, finalUrl: url, text: "" }; console.error(slug, String(e).slice(0, 120)); } }
  const pass = ok(res.text, sym);
  const reason = pass ? "" : res.text.length < MIN_CHARS ? `too short (${res.text.length} chars, http ${res.status})` : amounts(res.text, sym) ? `page is localised to another currency (more non-${sym} amounts than ${sym})` : `no ${sym} amounts on page`;
  if (pass) {
    const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${today()}${suffix}.txt`);
    const head = { url, finalUrl: res.finalUrl, fetchedAt: new Date().toISOString(), method, region, currency, http: res.status, sha256: crypto.createHash("sha256").update(res.text).digest("hex") };
    const ld = res.ld?.length ? `\n#JSONLD (structured data published on the page, verbatim)\n${res.ld.join("\n")}\n` : "";
    fs.writeFileSync(file, `#SNAPSHOT ${JSON.stringify(head)}\n${res.text}\n${ld}`);
  }
  return { slug, region, pass, reason, method };
}

export function latest(slug: string, region: "us" | "in" | `x${number}` = "us") {
  const dir = path.join(OUT, slug); if (!fs.existsSync(dir)) return null;
  const re = region === "us" ? /^\d{4}-\d\d-\d\d\.txt$/ : new RegExp(`^\\d{4}-\\d\\d-\\d\\d\\.${region}\\.txt$`);
  const f = fs.readdirSync(dir).filter((x) => re.test(x)).sort().pop();
  if (!f) return null;
  const raw = fs.readFileSync(path.join(dir, f), "utf8"); const nl = raw.indexOf("\n");
  return { date: f.slice(0, 10), file: path.join(dir, f), head: JSON.parse(raw.slice(10, nl)), text: raw.slice(nl + 1) };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/db.json"), "utf8"));
  const args = process.argv.slice(2), staleOnly = args.includes("--stale"), only = args.filter((a) => !a.startsWith("--"));
  const jobs: [string, string, string, "us" | "in", string, string][] = [];
  for (const t of db.tools as T[]) {
    if (only.length && !only.includes(t.slug)) continue;
    const ageOk = (r: "us" | "in") => { const l = latest(t.slug, r); return l && (Date.now() - Date.parse(l.date)) / 864e5 < 3; };
    const cur = t.pricing.currency ?? "USD", reg: "us" | "in" = cur === "INR" ? "in" : "us"; // INR-primary prices are read like the India line
    if (t.pricing.sourceUrl && !(staleOnly && ageOk("us"))) {
      jobs.push([t.slug, t.pricing.sourceUrl, cur, reg, expectSymbol(t.pricing.summary, cur), ""]);
      (t.pricing.extraSources ?? []).forEach((u, k) => jobs.push([t.slug, u, cur, reg, "", `.x${k + 1}`]));
    }
    if (t.pricing.india?.sourceUrl && !(staleOnly && ageOk("in"))) jobs.push([t.slug, t.pricing.india.sourceUrl, "INR", "in", "₹", ".in"]);
  }
  const results: Awaited<ReturnType<typeof snapshot>>[] = []; let i = 0;
  const worker = async () => { while (i < jobs.length) { const j = jobs[i++]; const r = await snapshot(...j); results.push(r); console.log(`${r.pass ? "ok  " : "FAIL"} ${r.slug} [${r.region}] ${r.method} ${r.reason}`); } };
  await Promise.all(Array.from({ length: 4 }, worker));
  await browser?.close();
  const failed = results.filter((r) => !r.pass);
  fs.writeFileSync(path.join(OUT, "_last-run.json"), JSON.stringify({ at: new Date().toISOString(), total: results.length, failed }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} snapshots saved; ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
}
if (require.main === module) main();
