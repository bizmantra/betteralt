import { NextResponse } from "next/server";

export const runtime = "nodejs";
const API = "https://api.resend.com";
const DOMAIN_ID = "e88a54ac-edc6-4717-9908-83ca187bbb6a";
const FROM = "BetterAlt <hello@findbetteralt.com>";
const REPLY_TO = "hello@findbetteralt.com";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[a-z]{2,}$/i;

// Simple best-effort rate limit (per serverless instance): 5 requests / 10 min per IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 5;
}

const PROPS = ["signup_source", "utm_source", "utm_medium", "utm_campaign", "referrer_host", "landing_path"];
let propsReady = false;
async function ensureProps(key: string) { // create the custom contact properties once; "already exists" is fine
  if (propsReady) return;
  await Promise.all(PROPS.map((k) => resend(key, "/contact-properties", { key: k, type: "string", fallback_value: "" }).then((r) => { if (!r.ok && !/exist|already|taken/i.test(JSON.stringify(r.j))) console.warn("subscribe: property", k, r.status, JSON.stringify(r.j)); })));
  propsReady = true;
}

let domainCache: { ok: boolean; at: number } | null = null;
async function domainVerified(key: string) {
  if (domainCache && Date.now() - domainCache.at < 10 * 60 * 1000) return domainCache.ok;
  try {
    const r = await fetch(`${API}/domains/${DOMAIN_ID}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    const j = await r.json();
    domainCache = { ok: r.ok && j.status === "verified", at: Date.now() };
  } catch { domainCache = { ok: false, at: Date.now() }; }
  return domainCache.ok;
}

async function resend(key: string, path: string, body?: object, method = "POST") {
  const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
}

const text = `Thanks for subscribing to BetterAlt.

Once a week we'll send you AI tool price changes and new alternatives, each with a link to the vendor's own pricing page.

While you wait for the first one:
- Price changes log: https://findbetteralt.com/changes
- Open-source AI tools: https://findbetteralt.com/open-source

Didn't sign up, or changed your mind? Just reply "unsubscribe" and we'll remove you.

BetterAlt · https://findbetteralt.com · Privacy: https://findbetteralt.com/privacy`;
const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0f172a;max-width:560px">
<p><strong>Thanks for subscribing to Better<span style="color:#4f46e5">Alt</span>.</strong></p>
<p>Once a week we'll send you <strong>AI tool price changes and new alternatives</strong>, each with a link to the vendor's own pricing page.</p>
<p>While you wait for the first one:<br>• <a href="https://findbetteralt.com/changes">Price changes log</a><br>• <a href="https://findbetteralt.com/open-source">Open-source AI tools</a></p>
<p style="color:#64748b;font-size:13px">Didn't sign up, or changed your mind? Just reply "unsubscribe" and we'll remove you.<br>BetterAlt · <a href="https://findbetteralt.com">findbetteralt.com</a> · <a href="https://findbetteralt.com/privacy">Privacy</a></p></div>`;

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY, segment = process.env.RESEND_SEGMENT_ID;
  if (!key || !segment) { console.error("subscribe: missing RESEND env"); return NextResponse.json({ ok: false, error: "Signups are temporarily unavailable." }, { status: 503 }); }
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });

  let body: { email?: unknown; company?: unknown; source?: unknown; attribution?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  // Honeypot: pretend success so bots learn nothing
  if (typeof body.company === "string" && body.company.trim() !== "") return NextResponse.json({ ok: true, message: "You're subscribed. Check your inbox." });
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  const source = typeof body.source === "string" ? body.source.slice(0, 100) : "unknown";
  // Attribution (stored as Resend contact properties on first signup only). Plain strings, length-capped, no PII.
  const attrIn = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
  const properties: Record<string, string> = { signup_source: source };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "referrer_host", "landing_path"]) {
    const v = attrIn[k]; if (typeof v === "string" && v.trim()) properties[k] = v.trim().replace(/[^\w.\-/:@ +]/g, "").slice(0, 100);
  }

  // 1. Existing contact? (Resend's create call upserts, so check first to avoid duplicate welcome emails)
  const g = await resend(key, `/contacts/${encodeURIComponent(email)}`, undefined, "GET");
  let isNew = !g.ok;
  if (isNew) {
    await ensureProps(key);
    let c = await resend(key, "/contacts", { email, unsubscribed: false, segments: [{ id: segment }], properties });
    if (!c.ok) { console.warn("subscribe: create with properties failed, retrying without", c.status, JSON.stringify(c.j)); c = await resend(key, "/contacts", { email, unsubscribed: false, segments: [{ id: segment }] }); }
    if (!c.ok) { console.error("subscribe: create contact failed", c.status, JSON.stringify(c.j)); return NextResponse.json({ ok: false, error: "We couldn't add you right now. Please try again later." }, { status: 502 }); }
  } else {
    const a = await resend(key, `/contacts/${encodeURIComponent(email)}/segments/${segment}`);
    if (!a.ok && !/exist|already/i.test(JSON.stringify(a.j))) console.error("subscribe: add to segment failed", a.status, JSON.stringify(a.j));
    if (g.j?.unsubscribed) {
      const u = await resend(key, `/contacts/${encodeURIComponent(email)}`, { unsubscribed: false }, "PATCH");
      if (!u.ok) console.error("subscribe: resubscribe failed", u.status, JSON.stringify(u.j));
    }
    isNew = false;
  }
  console.log("subscribe: contact ok", { new: isNew, source, utm_source: properties.utm_source ?? null, referrer_host: properties.referrer_host ?? null });

  // 2. Welcome email, only once and only from a verified domain
  if (isNew) {
    if (await domainVerified(key)) {
      const s = await resend(key, "/emails", { from: FROM, to: [email], reply_to: REPLY_TO, subject: "You're subscribed to BetterAlt", text, html, tags: [{ name: "type", value: "welcome" }] });
      if (!s.ok) console.error("subscribe: welcome email failed", s.status, JSON.stringify(s.j));
      else console.log("subscribe: welcome sent", s.j.id);
    } else console.warn("subscribe: domain not verified yet, welcome email skipped");
  }
  return NextResponse.json({ ok: true, message: isNew ? "You're subscribed. Check your inbox for a welcome email." : "You're already subscribed. Thanks!" });
}

export function GET() { return NextResponse.json({ ok: false, error: "Use POST" }, { status: 405 }); }
