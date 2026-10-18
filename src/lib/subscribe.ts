// Server-only helpers for the newsletter: signed tokens, trusted client IP, Resend calls, email templates.
// Double opt-in (18 Oct): a signup creates a PENDING contact (unsubscribed: true, signup_status "pending", no segment).
// Only the signed confirmation link makes it subscribed. This endpoint never flips an opted-out contact back on.
import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";
import { BRAND, SITE } from "./data";

export const API = "https://api.resend.com";
export const FROM = `${BRAND} <hello@findbetteralt.com>`;
export const REPLY_TO = "hello@findbetteralt.com";
export const CONFIRM_TTL_MS = 48 * 3600 * 1000;      // confirmation links expire after 48 hours
export const FORM_TTL_MS = 24 * 3600 * 1000;         // a form token is good for a day
export const MIN_FILL_MS = 2500;                     // faster than this from form load to submit = bot
export const RESEND_CONFIRM_AFTER_MS = 10 * 60 * 1000; // at most one confirmation email per address per 10 minutes

// ---------- signing key ----------
// SUBSCRIBE_TOKEN_SECRET if set (recommended: 32+ random bytes, set in Vercel). Otherwise a key DERIVED from
// RESEND_API_KEY with HKDF-SHA256 under a fixed, purpose-specific label: the API key itself is never used as the HMAC
// key, never leaves the server and can't be recovered from a token. Rotating either secret invalidates open links.
let cachedKey: Buffer | null = null;
export function signingKey(): Buffer | null {
  if (cachedKey) return cachedKey;
  const own = process.env.SUBSCRIBE_TOKEN_SECRET, api = process.env.RESEND_API_KEY;
  const ikm = own && own.length >= 32 ? own : api;
  if (!ikm) return null;
  cachedKey = Buffer.from(hkdfSync("sha256", ikm, "findbetteralt-newsletter", own ? "token-v1:own" : "token-v1:derived-from-resend", 32));
  return cachedKey;
}
const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");
export type TokenPurpose = "form" | "confirm" | "unsub";
export type TokenBody = { p: TokenPurpose; e?: string; iat: number; exp?: number };
export function signToken(body: TokenBody, key = signingKey()): string {
  if (!key) throw new Error("no signing key");
  const payload = b64u(JSON.stringify(body));
  return `${payload}.${b64u(createHmac("sha256", key).update(payload).digest())}`;
}
export function verifyToken(token: unknown, purpose: TokenPurpose, now = Date.now(), key = signingKey()): TokenBody | null {
  if (!key || typeof token !== "string" || token.length > 2000) return null;
  const [payload, sig, extra] = token.split("."); if (!payload || !sig || extra !== undefined) return null;
  const want = createHmac("sha256", key).update(payload).digest(), got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  let body: TokenBody; try { body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
  if (body.p !== purpose || typeof body.iat !== "number") return null;
  if (body.exp != null && now > body.exp) return null;
  if (purpose !== "form" && (typeof body.e !== "string" || !body.e)) return null;
  return body;
}

// ---------- trusted client IP ----------
// On Vercel the platform sets these headers itself and overwrites any client-sent X-Forwarded-For (Vercel docs,
// "Request headers"), so they can't be spoofed. x-vercel-forwarded-for is preferred because it survives a proxy in
// front of Vercel; x-real-ip and x-forwarded-for are the same value. Off Vercel (local dev) every header is
// client-controlled, so we don't trust any of them and key everyone as "local".
export function clientIp(h: Headers, onVercel = !!process.env.VERCEL): string {
  if (!onVercel) return "local";
  const v = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for") ?? "";
  return v.split(",")[0].trim() || "unknown";
}
// Best-effort per-instance limiter (serverless instances don't share memory). The durable per-address limit is the
// confirm_sent_at property on the Resend contact (see RESEND_CONFIRM_AFTER_MS).
const hits = new Map<string, number[]>();
export const resetRateLimits = () => hits.clear(); // tests only
export function limited(key: string, max = 5, winMs = 10 * 60 * 1000, now = Date.now()) {
  const arr = (hits.get(key) ?? []).filter((t) => now - t < winMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

// ---------- Resend ----------
// Resend allows 10 requests/second per account: a 429 is retried twice after a short wait.
export async function resend(key: string, path: string, body?: object, method = "POST", headers: Record<string, string> = {}) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...headers }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (r.status === 429 && attempt < 2) { await new Promise((ok) => setTimeout(ok, 1100 * (attempt + 1))); continue; }
    return { ok: r.ok, status: r.status, j };
  }
}
// Resend domain id (not a secret). RESEND_DOMAIN_ID overrides it if the sending domain is ever re-created.
const DOMAIN_ID = process.env.RESEND_DOMAIN_ID ?? "e88a54ac-edc6-4717-9908-83ca187bbb6a";
let domainCache: { ok: boolean; at: number } | null = null;
export async function domainVerified(key: string) {
  if (domainCache && Date.now() - domainCache.at < 10 * 60 * 1000) return domainCache.ok;
  try {
    const r = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    const j = await r.json();
    domainCache = { ok: r.ok && j.status === "verified", at: Date.now() };
  } catch { domainCache = { ok: false, at: Date.now() }; }
  return domainCache.ok;
}
export type Contact = { email: string; unsubscribed: boolean; props: Record<string, string> };
/** Resend returns properties as { key: { value, type } } (or plain values); flatten to strings. */
export function flattenProps(p: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (p && typeof p === "object") for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    const val = v && typeof v === "object" && "value" in (v as object) ? (v as { value: unknown }).value : v;
    if (val != null) out[k] = String(val);
  }
  return out;
}
export async function getContact(key: string, email: string): Promise<Contact | null | "error"> {
  const g = await resend(key, `/contacts/${encodeURIComponent(email)}`, undefined, "GET");
  if (g.status === 404) return null;
  if (!g.ok) return "error";
  return { email, unsubscribed: g.j?.unsubscribed === true, props: flattenProps(g.j?.properties) };
}
/** What the subscribe endpoint may do for an existing contact. Only a never-confirmed pending contact may get a
 *  (throttled) confirmation email. Confirmed, legacy-active and opted-out contacts are left exactly as they are. */
export function existingAction(c: Contact, now = Date.now()): "resend-confirm" | "throttled" | "none" {
  if (c.props.signup_status !== "pending" || !c.unsubscribed) return "none";
  const last = Date.parse(c.props.confirm_sent_at ?? "");
  return Number.isFinite(last) && now - last < RESEND_CONFIRM_AFTER_MS ? "throttled" : "resend-confirm";
}
/** May a confirmation link subscribe this contact? Only if it is still pending (never confirmed, never opted out). */
export const canConfirm = (c: Contact | null) => !!c && c.unsubscribed && c.props.signup_status === "pending";

// ---------- emails ----------
const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const wrap = (inner: string) => `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0f172a;max-width:560px">${inner}</div>`;
export function confirmEmail(link: string) {
  const subject = `Confirm your ${BRAND} subscription`;
  const text = `Please confirm you want the ${BRAND} weekly email (AI tool price changes and new alternatives, each with a link to the vendor's own pricing page).

Confirm: ${link}

This link expires in 48 hours. If you didn't sign up, ignore this email: you won't be subscribed and we won't email you again about it.

${BRAND} · ${SITE} · Privacy: ${SITE}/privacy`;
  const html = wrap(`<p><strong>Please confirm your subscription to ${esc(BRAND)}.</strong></p>
<p>You (or someone using your address) asked for the ${esc(BRAND)} weekly email: AI tool price changes and new alternatives, each with a link to the vendor's own pricing page.</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#15803d;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Confirm my subscription</a></p>
<p style="color:#64748b;font-size:13px">This link expires in 48 hours. If you didn't sign up, ignore this email: you won't be subscribed.<br>${esc(BRAND)} · <a href="${SITE}">findbetteralt.com</a> · <a href="${SITE}/privacy">Privacy</a></p>`);
  return { subject, text, html };
}
export function welcomeEmail(unsubLink: string) {
  const subject = `You're subscribed to ${BRAND}`;
  const text = `Thanks for subscribing to ${BRAND}.

Once a week we'll send you AI tool price changes and new alternatives, each with a link to the vendor's own pricing page.

While you wait for the first one:
- Price changes log: ${SITE}/changes
- Open-source AI tools: ${SITE}/open-source

Changed your mind? Unsubscribe: ${unsubLink}

${BRAND} · ${SITE} · Privacy: ${SITE}/privacy`;
  const html = wrap(`<p><strong>Thanks for subscribing to ${esc(BRAND)}.</strong></p>
<p>Once a week we'll send you <strong>AI tool price changes and new alternatives</strong>, each with a link to the vendor's own pricing page.</p>
<p>While you wait for the first one:<br>• <a href="${SITE}/changes">Price changes log</a><br>• <a href="${SITE}/open-source">Open-source AI tools</a></p>
<p style="color:#64748b;font-size:13px">Changed your mind? <a href="${esc(unsubLink)}">Unsubscribe</a>.<br>${esc(BRAND)} · <a href="${SITE}">findbetteralt.com</a> · <a href="${SITE}/privacy">Privacy</a></p>`);
  return { subject, text, html };
}
export const confirmLink = (token: string) => `${SITE}/newsletter/confirm?t=${encodeURIComponent(token)}`;
export const unsubLink = (token: string) => `${SITE}/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
export const unsubApi = (token: string) => `${SITE}/api/subscribe/unsubscribe?t=${encodeURIComponent(token)}`;
/** Neutral reply for every accepted signup, so the form never reveals whether an address is already on the list. */
export const NEUTRAL = "Thanks! Check your inbox: if this address isn't already on the list, we've sent a link to confirm your subscription.";
