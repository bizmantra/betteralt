import { NextResponse } from "next/server";
import { verifyToken, resend, getContact, clientIp, limited } from "@/lib/subscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (b: object, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

// POST: unsubscribe. Token from ?t= (RFC 8058 one-click from the List-Unsubscribe header) or the JSON body
// { t, erase } sent by the /newsletter/unsubscribe page. erase: true also deletes the address from Resend.
export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return json({ ok: false, error: "Temporarily unavailable. Email hello@findbetteralt.com and we'll remove you." }, 503);
  if (limited(`unsub:${clientIp(req.headers)}`, 30)) return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);
  const url = new URL(req.url);
  const body = (req.headers.get("content-type") ?? "").includes("application/json") ? await req.json().catch(() => ({})) : {};
  const tok = verifyToken((body as { t?: unknown }).t ?? url.searchParams.get("t"), "unsub");
  if (!tok) return json({ ok: false, error: "This unsubscribe link is invalid. Email hello@findbetteralt.com and we'll remove you." }, 400);
  const email = tok.e!, erase = (body as { erase?: unknown }).erase === true;
  const c = await getContact(key, email);
  if (c === "error") return json({ ok: false, error: "We couldn't update this right now. Please try again later." }, 502);
  if (c && erase) {
    const d = await resend(key, `/contacts/${encodeURIComponent(email)}`, undefined, "DELETE");
    if (!d.ok) { console.error("unsubscribe: delete failed", d.status, JSON.stringify(d.j)); return json({ ok: false, error: "We couldn't delete this right now. Please try again later." }, 502); }
    console.log("unsubscribe: erased"); return json({ ok: true, message: "You're unsubscribed and your email address has been deleted from our list." });
  }
  if (c) {
    const u = await resend(key, `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true, properties: { signup_status: "unsubscribed" } }, "PATCH");
    if (!u.ok) { console.error("unsubscribe: update failed", u.status, JSON.stringify(u.j)); return json({ ok: false, error: "We couldn't update this right now. Please try again later." }, 502); }
  }
  console.log("unsubscribe: done");
  return json({ ok: true, message: "You're unsubscribed. You won't get any more emails from us." });
}
