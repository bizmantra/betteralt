import { NextResponse } from "next/server";
import { signToken, verifyToken, clientIp, limited, resend, getContact, existingAction, confirmEmail, confirmLink, NEUTRAL, FROM, REPLY_TO, MIN_FILL_MS, FORM_TTL_MS, CONFIRM_TTL_MS, signingKey, domainVerified } from "@/lib/subscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[a-z]{2,}$/i;
const NO_STORE = { "Cache-Control": "no-store" };
const json = (b: object, status = 200) => NextResponse.json(b, { status, headers: NO_STORE });

const PROPS = ["signup_source", "utm_source", "utm_medium", "utm_campaign", "referrer_host", "landing_path", "signup_status", "confirm_sent_at", "confirmed_at"];
let propsReady = false;
// Create any missing custom contact properties: one list call, then only the missing ones, one at a time (Resend's
// 10 requests/second limit). Cached per serverless instance.
async function ensureProps(key: string) {
  if (propsReady) return true;
  const l = await resend(key, "/contact-properties", undefined, "GET");
  const have = new Set<string>(l.ok && Array.isArray(l.j?.data) ? l.j.data.map((x: { key: string }) => x.key) : []);
  for (const k of PROPS.filter((x) => !have.has(x))) {
    const r = await resend(key, "/contact-properties", { key: k, type: "string", fallback_value: "" });
    if (!r.ok && !/exist|already|taken/i.test(JSON.stringify(r.j))) { console.warn("subscribe: property", k, r.status, JSON.stringify(r.j)); return false; }
  }
  return (propsReady = true);
}
async function sendConfirm(key: string, email: string) {
  if (!(await domainVerified(key))) { console.warn("subscribe: domain not verified, confirmation skipped"); return false; }
  const now = Date.now(), m = confirmEmail(confirmLink(signToken({ p: "confirm", e: email, iat: now, exp: now + CONFIRM_TTL_MS })));
  const s = await resend(key, "/emails", { from: FROM, to: [email], reply_to: REPLY_TO, subject: m.subject, text: m.text, html: m.html, tags: [{ name: "type", value: "confirm" }] });
  if (!s.ok) { console.error("subscribe: confirmation email failed", s.status, JSON.stringify(s.j)); return false; }
  await resend(key, `/contacts/${encodeURIComponent(email)}`, { properties: { confirm_sent_at: new Date(now).toISOString() } }, "PATCH");
  console.log("subscribe: confirmation sent", s.j.id); return true;
}

/** GET: a signed form token (issued-at time) the form must send back, for the minimum time-to-submit check. */
export function GET(req: Request) {
  if (!signingKey()) return json({ ok: false, error: "Signups are temporarily unavailable." }, 503);
  if (limited(`ft:${clientIp(req.headers)}`, 60)) return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);
  const now = Date.now();
  return json({ ok: true, ft: signToken({ p: "form", iat: now, exp: now + FORM_TTL_MS }) });
}

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !signingKey()) { console.error("subscribe: missing RESEND env"); return json({ ok: false, error: "Signups are temporarily unavailable." }, 503); }
  if (limited(`sub:${clientIp(req.headers)}`)) return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);

  let body: { email?: unknown; company?: unknown; source?: unknown; attribution?: unknown; ft?: unknown };
  try { body = await req.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }
  // Honeypot: pretend success so bots learn nothing
  if (typeof body.company === "string" && body.company.trim() !== "") { console.log("subscribe: honeypot"); return json({ ok: true, message: NEUTRAL }); }
  // Minimum time-to-submit, measured from a server-signed form token (the client can't fake an earlier start time)
  const ft = verifyToken(body.ft, "form");
  if (!ft) return json({ ok: false, error: "This form has expired. Please refresh the page and try again." }, 400);
  if (Date.now() - ft.iat < MIN_FILL_MS) { console.log("subscribe: too fast"); return json({ ok: true, message: NEUTRAL }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false, error: "Please enter a valid email address." }, 400);
  const source = typeof body.source === "string" ? body.source.slice(0, 100) : "unknown";
  // Attribution (stored as Resend contact properties on first signup only). Plain strings, length-capped, no PII.
  const attrIn = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
  const properties: Record<string, string> = { signup_source: source };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "referrer_host", "landing_path"]) {
    const v = attrIn[k]; if (typeof v === "string" && v.trim()) properties[k] = v.trim().replace(/[^\w.\-/:@ +]/g, "").slice(0, 100);
  }

  const c = await getContact(key, email);
  if (c === "error") return json({ ok: false, error: "We couldn't add you right now. Please try again later." }, 502);
  if (c === null) {
    // New: create a PENDING contact. unsubscribed:true and no segment until the link is confirmed.
    if (!(await ensureProps(key))) return json({ ok: false, error: "We couldn't add you right now. Please try again later." }, 502);
    const r = await resend(key, "/contacts", { email, unsubscribed: true, properties: { ...properties, signup_status: "pending" } });
    if (!r.ok) { console.error("subscribe: create contact failed", r.status, JSON.stringify(r.j)); return json({ ok: false, error: "We couldn't add you right now. Please try again later." }, 502); }
    await sendConfirm(key, email);
    console.log("subscribe: pending", { source, utm_source: properties.utm_source ?? null, referrer_host: properties.referrer_host ?? null });
  } else {
    // Existing: never change subscription state here. A still-pending contact may get a fresh (throttled) link.
    const a = existingAction(c);
    if (a === "resend-confirm") await sendConfirm(key, email);
    console.log("subscribe: existing", { action: a, status: c.props.signup_status || "legacy", unsubscribed: c.unsubscribed });
  }
  return json({ ok: true, message: NEUTRAL });
}
