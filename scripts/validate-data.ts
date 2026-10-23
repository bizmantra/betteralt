/**
 * Publishing gate. Runs in `prebuild`; any HARD violation exits 1 and fails the build.
 * SOFT findings (stale snapshot, dead link) never fail the build: the item is demoted/hidden and listed in the report.
 * Output: src/data/gate.json (read by src/lib/data.ts at build) + data/gate-report.md (human report).
 *   npx tsx scripts/validate-data.ts            # full run incl. link checks
 *   GATE_OFFLINE=1 npx tsx scripts/validate-data.ts   # skip network link checks (reported as skipped)
 */
import fs from "node:fs"; import path from "node:path";
import { latest } from "./snapshot";
import { scanText, BUILD_PATH_SEGMENT } from "./lib/text-checks";
import { picks, groupAlts, qualifies, eligible, rankedPageViolations } from "../src/lib/picks";
import type { Tool } from "../src/lib/data";

const ROOT = path.resolve(__dirname, "..");
const MAX_AGE_DAYS = 14;
const OSI = new Set(["MIT", "Apache-2.0", "GPL-2.0", "GPL-3.0", "GPL-3.0-or-later", "AGPL-3.0", "LGPL-2.1", "LGPL-3.0", "MPL-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "EPL-2.0", "Unlicense", "Zlib"]);
const db = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/db.json"), "utf8"));
const allow: Record<string, string[]> = JSON.parse(fs.readFileSync(path.join(ROOT, "data/vendor-domains.json"), "utf8"));
const now = new Date(); const todayIso = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const ageDays = (iso: string) => (Date.parse(todayIso) - Date.parse(iso)) / 864e5;

const hard: string[] = []; const soft: string[] = [];
const H = (rule: string, msg: string) => hard.push(`[${rule}] ${msg}`);
const S = (rule: string, msg: string) => soft.push(`[${rule}] ${msg}`);

// ---------- normalised text matching ----------
export function norm(s: string) {
  return s.normalize("NFKC").replace(/[\u00a0\u2009\u202f\u2007]/g, " ").replace(/US\$/g, "$")
    .replace(/([$€£₹])\s+(?=\d)/g, "$1")                    // "$ 20" / "$\n20" → "$20"
    .replace(/(\d[\d.,]*)\s?€/g, "€$1")                       // "20 €" → "€20"
    .replace(/(\d)\s*\.\s*(\d)/g, "$1.$2")                         // "8 .33" / "5 . 00" (split price spans) → 8.33 / 5.00
    .replace(/(\d),(?=\d)/g, "$1")                             // 1,999 / 1,75,000 → 1999 / 175000
    .replace(/(\d)\.(\d*?[1-9])0+(?!\d)/g, "$1.$2")             // 14.50 → 14.5
    .replace(/(\d)\.0+(?!\d)/g, "$1")                          // 20.00 → 20
    .replace(/\s+/g, " ").toLowerCase();
}
export const priceTokens = (summary: string) => [...norm(summary).matchAll(/[$€£₹]\d+(?:\.\d+)?/g)].map((m) => m[0]);
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Exact normalised token ("$20"), or, for amounts with cents ("$11.69"), the bare number next to a non-digit when the
 *  page shows that currency elsewhere (vendors often render the symbol and the digits in separate elements). */
const hasToken = (hay: string, tok: string) => new RegExp(esc(tok) + "(?![\\d]|\\.\\d)").test(hay)
  || (/\.\d/.test(tok) && hay.includes(tok[0]) && new RegExp("(?<![\\d.])" + esc(tok.slice(1)) + "(?![\\d]|\\.\\d)").test(hay));
const STOP = new Set(["from", "paid", "plan", "plans", "starts", "start", "at", "is", "and", "or", "then", "with", "the", "a", "per", "only", "up", "to", "for", "of", "on", "in", "billed", "monthly", "annually", "yearly", "free", "self-hosted"]);
/** Plan names = the words right before a price in each ;/, segment (parentheses removed). */
export function planNames(summary: string) {
  const out: string[] = [];
  for (const seg of summary.replace(/\([^)]*\)/g, " ").split(/[;,]/)) {
    const m = seg.match(/^(.*?)[$€£₹]\s?\d/); if (!m) continue;
    const words = m[1].replace(/[:+]/g, " ").split(/\s+/).map((w) => w.trim()).filter((w) => w && !STOP.has(w.toLowerCase()) && /[a-z]/i.test(w));
    if (words.length) out.push(words.join(" "));
  }
  return out;
}
const nameIn = (hay: string, name: string) => hay.includes(norm(name)) || norm(name).split(" ").filter((w) => w.length >= 3).every((w) => new RegExp(`\\b${esc(w)}`).test(hay));

function regDomain(u: string) { const h = new URL(u).hostname.toLowerCase().replace(/^www\./, ""); const p = h.split("."); return (p.length > 2 && ["co", "com"].includes(p[p.length - 2]) && p[p.length - 1].length === 2) ? p.slice(-3).join(".") : p.slice(-2).join("."); }
function sourceAllowed(t: Tool, src: string) {
  const d = regDomain(src);
  if (d === regDomain(t.url)) return true;
  if ((allow[t.slug] ?? []).some((x) => d === x || new URL(src).hostname.endsWith("." + x) || new URL(src).hostname === x)) return true;
  if (t.openSource?.repo && src.replace(/\/$/, "").toLowerCase() === t.openSource.repo.replace(/\/$/, "").toLowerCase()) return true;
  return false;
}

// ---------- per-tool price checks ----------
type GateTool = { verified: boolean; reason?: "stale" | "dead-link" | "never-verified"; checkedAt?: string; snapshot?: string; inCheckedAt?: string; inSnapshot?: string };
const gateTools: Record<string, GateTool> = {};
const tools = db.tools as Tool[];
function checkPrice(t: Tool, summary: string, snapText: string, where: string) {
  const hay = norm(snapText);
  for (const tok of priceTokens(summary)) if (!hasToken(hay, tok)) H("price-in-snapshot", `${t.slug}${where}: price ${tok} not found in snapshot`);
  for (const n of planNames(summary)) if (!nameIn(hay, n)) H("plan-in-snapshot", `${t.slug}${where}: plan name "${n}" not found in snapshot`);
}
for (const t of tools) {
  const p = t.pricing; const g: GateTool = { verified: !!p.verified && !!p.summary };
  gateTools[t.slug] = g;
  for (const src of [p.sourceUrl, ...(p.extraSources ?? []), p.india?.sourceUrl].filter(Boolean) as string[])
    if (!sourceAllowed(t, src)) H("vendor-domain", `${t.slug}: source ${src} is not on ${regDomain(t.url)} or an allowlisted domain of the same vendor`);
  if (!g.verified) { g.reason = "never-verified"; if (p.summary) H("unverified-has-price", `${t.slug}: unverified but has a price summary`); continue; }
  const hasAmount = /[$€£₹]\s?\d/.test(p.summary!);
  // billing basis (only meaningful when the summary has an amount)
  if (hasAmount && !["monthly", "annual", "unknown"].includes(p.fromBilling as string)) H("billing-basis", `${t.slug}: pricing.fromBilling must be monthly, annual or unknown (got ${p.fromBilling ?? "unset"})`);
  // USD primary
  if (hasAmount && !p.currency) H("usd-primary", `${t.slug}: currency missing`);
  if (p.currency !== "USD" && p.fromUsdMonthly != null) H("usd-primary", `${t.slug}: fromUsdMonthly set but currency is ${p.currency}`);
  if (p.currency === "USD" && /[₹€£]\s?\d/.test(p.summary!)) H("usd-primary", `${t.slug}: USD summary contains a non-USD amount`);
  const toks = priceTokens(p.summary!), fu = p.fromUsdMonthly;
  const derived = fu != null && p.fromBilling === "annual" && toks.some((tk) => tk[0] === "$" && Math.abs(+tk.slice(1) / 12 - fu) < 0.006); // e.g. $144/yr → $12/mo
  if (fu != null && fu > 0 && !toks.includes(norm(`$${fu}`)) && !derived) H("price-in-summary", `${t.slug}: starting price $${p.fromUsdMonthly} is not in the summary`);
  // tags vs plans
  if (t.tags.includes("free") && p.fromUsdMonthly != null && p.fromUsdMonthly > 0) H("tags", `${t.slug}: tagged "free" but has a paid plan from $${p.fromUsdMonthly}; use "freemium"`);
  if (t.tags.includes("freemium") && p.hasFreePlan !== true) H("tags", `${t.slug}: tagged "freemium" but hasFreePlan is not true`);
  if (p.hasFreePlan === true && !t.tags.some((x) => x === "free" || x === "freemium")) H("tags", `${t.slug}: has a $0 plan but no free/freemium tag`);
  // snapshot
  const snap = latest(t.slug, "us");
  if (!snap) { H("snapshot-missing", `${t.slug}: verified price has no stored snapshot`); continue; }
  if (snap.head.url !== p.sourceUrl) H("snapshot-url", `${t.slug}: latest snapshot is of ${snap.head.url}, not the current source ${p.sourceUrl}`);
  const extras = (p.extraSources ?? []).map((u, k) => { const x = latest(t.slug, `x${k + 1}`); if (!x) H("snapshot-missing", `${t.slug}: extra source ${u} has no snapshot`); else if (x.head.url !== u) H("snapshot-url", `${t.slug}: extra snapshot is of ${x.head.url}, not ${u}`); return x?.text ?? ""; });
  const usText = [snap.text, ...extras].join("\n");
  checkPrice(t, p.summary!, usText, "");
  const licensed = !!t.openSource && fs.existsSync(path.join(ROOT, "data/snapshots", t.slug)) && fs.readdirSync(path.join(ROOT, "data/snapshots", t.slug)).some((f) => f.startsWith("license-"));
  const inText = p.india ? latest(t.slug, "in")?.text ?? "" : "";
  if (p.hasFreePlan === true && !licensed && !/\bfree\b|[$₹€£]0\b/.test(norm(usText + "\n" + inText))) H("free-plan-in-snapshot", `${t.slug}: hasFreePlan but the snapshot never says "free" or "$0"`);
  if (p.fromBilling === "annual" && !/annual|year|\/yr/.test(norm(usText))) H("billing-in-snapshot", `${t.slug}: fromBilling annual but the snapshot never mentions annual/yearly billing`);
  g.checkedAt = snap.date; g.snapshot = path.relative(ROOT, snap.file);
  if (ageDays(snap.date) > MAX_AGE_DAYS) { g.verified = false; g.reason = "stale"; S("max-age", `${t.slug}: newest snapshot ${snap.date} is older than ${MAX_AGE_DAYS} days → shown as not yet verified`); }
  if (p.india) {
    const si = latest(t.slug, "in");
    if (!si) H("snapshot-missing", `${t.slug}: India price has no stored India snapshot`);
    else { checkPrice(t, p.india.summary, si.text, " [India]"); g.inCheckedAt = si.date; g.inSnapshot = path.relative(ROOT, si.file); }
  }
}

// ---------- licence taxonomy ----------
for (const t of tools) {
  const o = t.openSource, tagged = t.tags.includes("open source");
  if (tagged && !o) { H("licence", `${t.slug}: tagged open source without licence data`); continue; }
  if (!o) continue;
  if (!["open-source", "source-available", "fair-code"].includes(o.licenseType)) H("licence", `${t.slug}: licenseType missing/invalid`);
  if (o.licenseType === "open-source") {
    const ids = o.license.split(/[\s/,;()]+/).filter((x) => x !== "or" && x !== "and").filter((x) => /^[A-Z][A-Za-z0-9.+-]+$/.test(x) && x !== "core" );
    if (!ids.length || !ids.every((x) => OSI.has(x))) H("licence", `${t.slug}: licenseType open-source but "${o.license}" is not a list of OSI-approved SPDX ids`);
    if (!tagged) H("licence", `${t.slug}: OSI licence but missing "open source" tag`);
  } else {
    if (tagged) H("licence", `${t.slug}: ${o.licenseType} licence but tagged "open source"`);
    if (!t.tags.includes(o.licenseType)) H("licence", `${t.slug}: missing "${o.licenseType}" tag`);
  }
  if (/custom|see repo/i.test(o.license)) H("licence", `${t.slug}: licence is a placeholder ("${o.license}")`);
  const dir = path.join(ROOT, "data/snapshots", t.slug);
  if (!fs.existsSync(dir) || !fs.readdirSync(dir).some((f) => f.startsWith("license-"))) H("licence-evidence", `${t.slug}: no licence snapshot (run scripts/licenses.ts)`);
}

// ---------- links (soft) ----------
type Dead = { url: string; status: string; slug: string; kind: "price-source" | "reddit" };
const dead: Dead[] = []; let linkCheck = "skipped (GATE_OFFLINE=1)";
const anchorsAll = [...db.anchors, ...db.saas];
const reddit: { url: string; slug: string; kind: "quote" | "thread"; text?: string; capturedAt?: string }[] = [];
for (const a of [...anchorsAll, ...tools.map((t) => ({ slug: t.slug, redditSummary: t.notes?.redditSummary }))]) {
  const r = a.redditSummary; if (!r) continue;
  for (const q of r.quotes ?? []) {
    reddit.push({ url: q.url, slug: a.slug, kind: "quote", text: q.text, capturedAt: q.capturedAt });
    if (!/^https:\/\/(www\.|old\.)?reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+\//i.test(q.url ?? "")) H("reddit-permalink", `${a.slug}: quote url is not a Reddit permalink: ${q.url}`);
    if (!q.capturedAt) H("reddit-date", `${a.slug}: quote has no capturedAt date`);
    if (!(q as { liveCheckedAt?: string }).liveCheckedAt) S("reddit-not-live-checked", `${a.slug}: quote hidden until liveCheckedAt is set (thread links + labelled summary show instead)`);
    if (/^["“”']|["“”']$/.test(q.text ?? "")) H("reddit-verbatim", `${a.slug}: store quote text without surrounding quote marks`);
    const id = (q.url.match(/comments\/([a-z0-9]+)/i) ?? [])[1];
    const snapf = id && path.join(ROOT, "data/snapshots/reddit", `${id}.txt`);
    if (!snapf || !fs.existsSync(snapf)) H("reddit-verbatim", `${a.slug}: no stored thread snapshot data/snapshots/reddit/${id}.txt to prove the quote is verbatim`);
    else if (!norm(fs.readFileSync(snapf, "utf8")).includes(norm(q.text))) H("reddit-verbatim", `${a.slug}: quote is not verbatim in the stored thread snapshot`);
  }
  for (const th of r.threads ?? []) reddit.push({ url: th.url, slug: a.slug, kind: "thread" });
}
async function probe(url: string): Promise<string | null> {
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; FindBetterAltLinkCheck/1.0)", "Accept-Language": "en-US" } });
    if (r.status === 405 || r.status === 404) r = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; FindBetterAltLinkCheck/1.0)", "Accept-Language": "en-US" } });
    return r.status === 404 || r.status === 410 ? `http ${r.status}` : null; // 403/429/5xx = bot-blocked or flaky, not proof of a dead page
  } catch (e) { const c = (e as { cause?: { code?: string } }).cause?.code; return c === "ENOTFOUND" ? "dns ENOTFOUND" : null; }
}
async function linkChecks() {
  if (process.env.GATE_OFFLINE) return;
  const jobs: { url: string; slug: string; kind: Dead["kind"] }[] = [];
  for (const t of tools) for (const u of [t.pricing.sourceUrl, ...(t.pricing.extraSources ?? []), t.pricing.india?.sourceUrl].filter(Boolean) as string[]) jobs.push({ url: u, slug: t.slug, kind: "price-source" });
  for (const r of reddit) jobs.push({ url: r.url, slug: r.slug, kind: "reddit" });
  let i = 0; const run = async () => { while (i < jobs.length) { const j = jobs[i++]; const bad = await probe(j.url); if (bad) dead.push({ ...j, status: bad }); } };
  await Promise.all(Array.from({ length: 12 }, run));
  linkCheck = `${jobs.length} links checked, ${dead.length} dead`;
  for (const d of dead) {
    S("dead-link", `${d.slug}: ${d.kind} ${d.url} (${d.status}) → hidden`);
    if (d.kind === "price-source" && d.url === tools.find((t) => t.slug === d.slug)?.pricing.sourceUrl) { const g = gateTools[d.slug]; if (g.verified) { g.verified = false; g.reason = "dead-link"; } }
  }
}

// ---------- changes ----------
function checkChanges() {
  for (const c of db.changes) {
    if (!["vendor_change", "correction"].includes(c.type)) { H("changes-type", `${c.id}: type must be vendor_change or correction`); continue; }
    const ev = c.evidence; const ex = (f?: string | null) => !!f && fs.existsSync(path.join(ROOT, f));
    if (!ev || !ex(ev.after)) { H("changes-evidence", `${c.id}: evidence.after snapshot missing`); continue; }
    if (!norm(fs.readFileSync(path.join(ROOT, ev.after), "utf8")).length || !priceTokens(c.new).every((tk) => hasToken(norm(fs.readFileSync(path.join(ROOT, ev.after), "utf8")), tk))) H("changes-evidence", `${c.id}: new price not in the after snapshot`);
    if (c.type === "vendor_change") {
      if (!ex(ev.before)) H("changes-evidence", `${c.id}: vendor_change needs a before snapshot (old snapshot vs new snapshot)`);
      else if (!priceTokens(c.old).every((tk) => hasToken(norm(fs.readFileSync(path.join(ROOT, ev.before), "utf8")), tk))) H("changes-evidence", `${c.id}: old price not in the before snapshot`);
    } else if (!ev.note) H("changes-evidence", `${c.id}: correction needs evidence.note explaining what was wrong`);
  }
}

// ---------- ranking + badges (uses the same functions the templates use) ----------
function checkListings() {
  const eff = tools.map((t) => ({ ...t, pricing: { ...t.pricing, verified: gateTools[t.slug].verified, lastChecked: gateTools[t.slug].checkedAt ?? t.pricing.lastChecked } })) as Tool[];
  const by = new Map(eff.map((t) => [t.slug, t]));
  const pages = [...db.anchors.map((a: { slug: string; alternatives: (string | { slug: string })[]; verdict?: object }) => ({ path: `/alternatives/${a.slug}`, alts: a.alternatives, verdict: a.verdict, anchor: a.slug })),
    ...db.saas.map((s: { slug: string; toolSlug?: string; alternatives: (string | { slug: string })[]; verdict?: object }) => ({ path: `/ai-alternative-to/${s.slug}`, alts: s.alternatives, verdict: s.verdict, anchor: s.toolSlug }))];
  for (const pg of pages) {
    const items = pg.alts.map((x: string | { slug: string }) => by.get(typeof x === "string" ? x : x.slug)!).filter(Boolean);
    const { ranked, unverified } = groupAlts(items);
    for (const t of ranked) if (!eligible(t)) H("unverified-ranked", `${pg.path}: ${t.slug} ranked but not verified`);
    const anchor = pg.anchor ? by.get(pg.anchor) : undefined;
    const pk = picks(items, pg.verdict as never, (s) => by.get(s), anchor);
    for (const k of pk) {
      if (!eligible(k.tool)) H("badge-verified", `${pg.path}: ${k.label} → ${k.tool.slug} is not verified`);
      if (unverified.includes(k.tool)) H("badge-verified", `${pg.path}: unverified ${k.tool.slug} badged`);
      // every badge, editorial or rule-based, must meet its factual rule against the pool that was left when it was assigned
      // every badge, editorial or rule-based, must pass its factual test (budget: cheaper than the anchor, same billing basis)
      if (!qualifies(k.kind, k.tool, ranked, anchor)) H(`badge-${k.kind}`, `${pg.path}: ${k.label} → ${k.tool.slug} fails the ${k.kind} rule`);
      if (k.editorial && !(pg.verdict as { pickReasons?: Record<string, string> } | undefined)?.pickReasons?.[k.kind]) H("badge-editorial", `${pg.path}: editorial ${k.label} has no written reason`);
      if (!k.editorial && k.kind === "overall") H("badge-editorial", `${pg.path}: Best overall must be editorial`);
    }
  }
}

// ---------- stacks + compare pages: ranked lists must be verified-only (Draco gate review §3, 18 Oct) ----------
// Data check (lib/picks.ts rankedPageViolations): the ranked group each stack/compare page renders (same groupItems() as the template) has no
// unverified tool. Template check: every stacks/compare page must build its ranked list through the shared grouping
// (groupItems / groupAlts / AltTemplate), so a page can't rank raw items and bypass the rule.
function rankedTemplatesUngated() {
  const out: string[] = [];
  const walk = (d: string): string[] => !fs.existsSync(d) ? [] : fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of [...walk(path.join(ROOT, "src/app/stacks")), ...walk(path.join(ROOT, "src/app/compare")), ...walk(path.join(ROOT, "src/app/categories")), ...walk(path.join(ROOT, "src/app/free-ai-tools")), ...walk(path.join(ROOT, "src/app/teachers"))]) {
    if (!/page\.tsx$/.test(f)) continue; const src = fs.readFileSync(f, "utf8");
    const lists = /ItemList|<ol\b|position=\{/.test(src), gated = /\b(groupItems|groupAlts)\(|<AltTemplate\b/.test(src);
    if (lists && !gated) out.push(`${path.relative(ROOT, f)} renders a ranked list without groupItems()/groupAlts(), so unverified tools could be ranked`);
    if (/\.items\.map\(\(\w+, i\)/.test(src)) out.push(`${path.relative(ROOT, f)} numbers raw items (.items.map((x, i) ...)); rank only the verified group`);
  }
  return out;
}
function checkStacksCompare() {
  const eff = tools.map((t) => ({ ...t, pricing: { ...t.pricing, verified: gateTools[t.slug].verified } })) as Tool[];
  for (const m of rankedPageViolations(eff, db.stacks ?? [], db.compares ?? [])) H("unverified-ranked", m);
  for (const m of rankedTemplatesUngated()) H("ranked-list-ungated", m);
}

// ---------- judgement layer: "(our view)" lines, sourced lines, autoev evidence (Draco pass 2) ----------
const LEGAL = /\b(own(s|ed|ership)?|licen[cs]\w*|copyright\w*|indemn\w*|gdpr|hipaa|soc ?2|trained on|terms of (service|use)|liabilit\w*|complian\w*|commercial use|rights?|lawful|legal\w*|refund\w*)\b/i;
const NUMBER = /[$€£₹]|\d/;
const PLAN_WORDS = new Set<string>();
for (const t of tools) for (const n of planNames(t.pricing.summary ?? "")) for (const w of n.split(/\s+/)) if (/^[A-Z][a-z]{2,}$/.test(w) && !["Free", "Monthly", "Annual", "Annually", "Month", "Year"].includes(w)) PLAN_WORDS.add(w);
const NAME_WORDS = new Set(tools.flatMap((t) => `${t.name} ${(t as { vendor?: string }).vendor ?? ""}`.split(/[^A-Za-z]+/)));
for (const w of [...PLAN_WORDS]) if (NAME_WORDS.has(w) || ["Agent", "Sync", "Cloud", "App", "Apps", "Web", "Desktop", "Credits", "Seat", "User"].includes(w)) PLAN_WORDS.delete(w);
const PLAN_RE = new RegExp(`\\b(${[...PLAN_WORDS, "Plus", "Pro", "Max", "Team", "Teams", "Business", "Enterprise", "Starter", "Basic", "Premium", "Essential", "Ultra"].map(esc).join("|")})\\b`);
// snapshot text by URL (any stored snapshot whose #SNAPSHOT url or finalUrl matches)
const snapByUrl = new Map<string, string>();
function indexSnapshots() {
  const base = path.join(ROOT, "data/snapshots");
  for (const d of fs.readdirSync(base, { withFileTypes: true })) if (d.isDirectory() && d.name !== "reddit") for (const f of fs.readdirSync(path.join(base, d.name))) {
    if (!f.endsWith(".txt") || f.startsWith("license-")) continue;
    const txt = fs.readFileSync(path.join(base, d.name, f), "utf8"); const m = txt.match(/^#SNAPSHOT (\{.*\})/m); if (!m) continue;
    try { const h = JSON.parse(m[1]); for (const u of [h.url, h.finalUrl]) if (u) { const k = u.replace(/\/$/, ""); snapByUrl.set(k, (snapByUrl.get(k) ?? "") + "\n" + norm(txt)); } } catch { /* header not JSON */ }
  }
}
function checkJudgement(root: unknown = db, label = "db") {
  if (!snapByUrl.size) indexSnapshots();
  const opinion = (where: string, text: string) => {
    const t = text.replace(/\(our view\)/gi, "");
    if (NUMBER.test(t)) H("our-view-number", `${where}: "(our view)" line contains a number or price: ${text.slice(0, 120)}`);
    const pm = t.match(PLAN_RE); if (pm) H("our-view-plan", `${where}: "(our view)" line names a plan (${pm[1]}): ${text.slice(0, 120)}`);
    const lm = t.match(LEGAL); if (lm) H("our-view-legal", `${where}: "(our view)" line makes a legal/ownership claim (${lm[0]}): ${text.slice(0, 120)}`);
  };
  const sourced = (where: string, text: string, src: string, quote?: string) => {
    const hay = quote ? norm(quote) : snapByUrl.get(src.replace(/\/$/, ""));
    const nums = [...norm(text).matchAll(/[$€£₹]?\d+(?:\.\d+)?/g)].map((m) => m[0]);
    const plans = [...text.matchAll(new RegExp(PLAN_RE.source, "g"))].map((m) => m[1]);
    if (!nums.length && !plans.length) return;
    if (!hay) { H("sourced-no-evidence", `${where}: line has numbers/plan names but no quote and no stored snapshot of ${src}`); return; }
    for (const n of nums) if (!hasToken(hay, n)) H("sourced-number", `${where}: "${n}" is not in its quote/snapshot (${src})`);
    for (const pl of plans) if (!nameIn(hay, pl)) H("sourced-plan", `${where}: plan "${pl}" is not in its quote/snapshot (${src})`);
  };
  const walk = (o: unknown, where: string): void => {
    if (typeof o === "string") { if (/\(our view\)/i.test(o)) opinion(where, o); return; }
    if (Array.isArray(o)) { o.forEach((v, i) => walk(v, `${where}[${i}]`)); return; }
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    if ((r.basis === "our view" || r.opinion === true) && typeof r.text === "string") opinion(where, r.text);
    if (typeof r.sourceUrl === "string" && typeof r.text === "string") sourced(where, r.text, r.sourceUrl, typeof r.quote === "string" ? r.quote : undefined);
    const ev = r.evidence as Record<string, unknown> | undefined;
    if (ev && typeof ev === "object" && /autoev/i.test(JSON.stringify([ev.method, ev.pickedBy, ev.source, ev.tool])) && ev.humanConfirmed !== true) H("autoev-unconfirmed", `${where}: autoev.py-picked evidence needs evidence.humanConfirmed: true`);
    for (const [k, v] of Object.entries(r)) if (k !== "pricing" && k !== "changes") walk(v, `${where}.${k}`);
  };
  walk(root, label);
}

// ---------- retired brand + Dell (scripts/lib/text-checks.ts) ----------
// Case-insensitive, HTML/JSX tags stripped, entities and \u escapes decoded, lookalike and zero-width characters folded.
// Retired brand = BetterAlt / Better Alt / Better-Alt / betteralts; FindBetterAlt and findbetteralt.com are allowed.
// Scans site sources (src incl. email templates in api routes, public, data, README, next.config). Vendor snapshots are
// evidence copies of third-party pages and are excluded. The built output (.next) is scanned after `next build` by
// `validate-data.ts --built` (npm postbuild), so anything that reaches HTML, RSC, JSON-LD, llms.txt, RSS or JS is covered.
const SOURCE_ROOTS = ["src", "public", "data", "README.md", "next.config.ts"];
function checkBrandAndDell() {
  const hits = scanText(SOURCE_ROOTS.map((r) => path.join(ROOT, r)), ROOT, { skipDirs: ["snapshots", "node_modules", ".next", ".git"], skipFiles: /(gate\.json|gate-report\.md)$/ });
  for (const h of hits) if (h.rule === "no-dell") H("no-dell", `"Dell" found in ${h.file}`); else H("retired-brand", `retired brand "${h.match}" in ${h.file} (use siteConfig.brand / FindBetterAlt)`);
}
function checkBuilt() {
  const dir = path.join(ROOT, ".next");
  if (!fs.existsSync(dir)) { console.log("built-output scan: no .next directory (run next build first)"); process.exit(1); }
  // What the site serves: prerendered pages/routes (.next/server/app: HTML, RSC payloads, JSON-LD, llms.txt, RSS,
  // sitemap) and every client asset (.next/static). Server-only vendor chunks (.next/server/chunks, e.g. Next's bundled
  // user-agent parser, which lists device makers) are never sent to visitors and are skipped.
  const hits = scanText([path.join(dir, "server/app"), path.join(dir, "static")], ROOT, { skipDirs: ["cache"], skipFiles: /\.(map|nft\.json)$/, ignore: [BUILD_PATH_SEGMENT, /betteralt(?:-[a-z0-9-]+)?\.vercel\.app/gi] }); // preview deploys: Next points og:image at the preview host
  for (const h of hits) console.log(`  HARD [${h.rule}] "${h.match}" in built output ${h.file}`);
  console.log(`built-output scan: ${hits.length} violations`);
  process.exit(hits.length ? 1 : 0);
}

// ---------- editorial pages (src/data/pages.json): verbatim quotes, gate rules from Hermione's use-case format ----------
function checkPages() {
  const pages = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/pages.json"), "utf8"));
  checkJudgement(pages, "pages");
  const quotes: { where: string; url: string; quote: string }[] = [];
  const walk = (o: unknown, where: string): void => { if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${where}[${i}]`)); else if (o && typeof o === "object") { const r = o as Record<string, unknown>; if (typeof r.quote === "string" && typeof r.sourceUrl === "string") quotes.push({ where, url: r.sourceUrl, quote: r.quote }); for (const [k, v] of Object.entries(r)) walk(v, `${where}.${k}`); } };
  walk(pages, "pages");
  for (const q of quotes) { const hay = snapByUrl.get(q.url.replace(/\/$/, "")); if (!hay) H("page-quote", `${q.where}: no stored snapshot of ${q.url}`); else if (!hay.includes(norm(q.quote))) H("page-quote", `${q.where}: quote is not verbatim in the snapshot of ${q.url}`); }
  for (const [k, pg] of Object.entries(pages as Record<string, { steps?: unknown[]; limits?: unknown[]; tools?: { tool: string }[] }>)) {
    if ((pg.steps ?? []).length < 3) H("page-steps", `pages.${k}: needs at least 3 steps`);
    if ((pg.limits ?? []).length < 1) H("page-limits", `pages.${k}: needs at least 1 sourced limit`);
    if (!quotes.some((q) => q.where.startsWith(`pages.${k}`))) H("page-sources", `pages.${k}: needs at least 1 source`);
    for (const it of pg.tools ?? []) if (!tools.some((t) => t.slug === it.tool)) H("page-tool", `pages.${k}: unknown tool ${it.tool}`);
  }
}
async function main() {
  if (process.argv.includes("--built")) return checkBuilt();
  // Dry-run the judgement checks on draft files without touching the site: GATE_JUDGE_FILES=a.json,b.json
  if (process.env.GATE_JUDGE_FILES) {
    for (const f of process.env.GATE_JUDGE_FILES.split(",")) checkJudgement(JSON.parse(fs.readFileSync(f, "utf8")), path.basename(f));
    for (const x of hard) console.log("  HARD " + x); console.log(`judgement dry-run: ${hard.length} violations`); return;
  }
  await linkChecks(); checkChanges(); checkListings(); checkStacksCompare(); checkJudgement(); checkPages(); checkBrandAndDell();
  const out = { generatedAt: now.toISOString(), maxAgeDays: MAX_AGE_DAYS, linkCheck, tools: gateTools, dead: dead.map(({ url, status, slug, kind }) => ({ url, status, slug, kind })), hard: hard.length, soft };
  fs.writeFileSync(path.join(ROOT, "src/data/gate.json"), JSON.stringify(out, null, 1) + "\n");
  const verified = Object.values(gateTools).filter((g) => g.verified).length;
  const rep = `# Gate report ${now.toISOString()}\n\n- tools: ${tools.length}, verified after gate: ${verified}\n- links: ${linkCheck}\n- hard violations: ${hard.length}\n- soft findings: ${soft.length}\n\n## Hard\n${hard.map((x) => `- ${x}`).join("\n") || "- none"}\n\n## Soft\n${soft.map((x) => `- ${x}`).join("\n") || "- none"}\n`;
  fs.writeFileSync(path.join(ROOT, "data/gate-report.md"), rep);
  console.log(`gate: ${tools.length} tools, ${verified} verified, ${linkCheck}; ${hard.length} hard violations, ${soft.length} soft findings`);
  for (const x of soft) console.log("  soft " + x);
  for (const x of hard) console.log("  HARD " + x);
  process.exit(hard.length ? 1 : 0);
}
main();
