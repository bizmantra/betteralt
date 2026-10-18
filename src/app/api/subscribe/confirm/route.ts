import { NextResponse } from "next/server";
import { verifyToken, resend, getContact, canConfirm, welcomeEmail, unsubLink, unsubApi, signToken, clientIp, limited, FROM, REPLY_TO, domainVerified } from "@/lib/subscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (b: object, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

// POST { t }: confirm a pending signup (the /newsletter/confirm page posts here after a click, so link scanners that
// only GET the email link can't confirm anyone).
export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY, segment = process.env.RESEND_SEGMENT_ID;
  if (!key || !segment) return json({ ok: false, error: "Signups are temporarily unavailable." }, 503);
  if (limited(`confirm:${clientIp(req.headers)}`, 20)) return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);
  const body = await req.json().catch(() => ({}));
  const tok = verifyToken((body as { t?: unknown }).t, "confirm");
  if (!tok) return json({ ok: false, error: "This confirmation link is invalid or has expired. Please sign up again." }, 400);
  const email = tok.e!;
  const c = await getContact(key, email);
  if (c === "error") return json({ ok: false, error: "We couldn't confirm you right now. Please try again later." }, 502);
  if (c && !c.unsubscribed && c.props.signup_status !== "pending") return json({ ok: true, message: "You're already subscribed. Thanks!" });
  if (!canConfirm(c)) return json({ ok: false, error: "This confirmation link is no longer valid. Please sign up again." }, 400);
  const u = await resend(key, `/contacts/${encodeURIComponent(email)}`, { unsubscribed: false, properties: { signup_status: "confirmed", confirmed_at: new Date().toISOString() } }, "PATCH");
  if (!u.ok) { console.error("confirm: update failed", u.status, JSON.stringify(u.j)); return json({ ok: false, error: "We couldn't confirm you right now. Please try again later." }, 502); }
  const a = await resend(key, `/contacts/${encodeURIComponent(email)}/segments/${segment}`);
  if (!a.ok && !/exist|already/i.test(JSON.stringify(a.j))) console.error("confirm: add to segment failed", a.status, JSON.stringify(a.j));
  if (await domainVerified(key)) {
    const ut = signToken({ p: "unsub", e: email, iat: Date.now() });
    const m = welcomeEmail(unsubLink(ut));
    const s = await resend(key, "/emails", { from: FROM, to: [email], reply_to: REPLY_TO, subject: m.subject, text: m.text, html: m.html, tags: [{ name: "type", value: "welcome" }],
      headers: { "List-Unsubscribe": `<${unsubApi(ut)}>, <mailto:hello@findbetteralt.com?subject=unsubscribe>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
    if (!s.ok) console.error("confirm: welcome email failed", s.status, JSON.stringify(s.j)); else console.log("confirm: welcome sent", s.j.id);
  }
  console.log("confirm: subscribed", { source: c!.props.signup_source ?? null });
  return json({ ok: true, message: "You're subscribed. A welcome email is on its way." });
}
