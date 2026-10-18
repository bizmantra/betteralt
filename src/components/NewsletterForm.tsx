"use client";
import { useEffect, useId, useState, type FormEvent } from "react";
import { track } from "@/lib/track";
// Server-signed form token (issued-at time) for the minimum time-to-submit check. One request per page, shared by all forms.
let ftPromise: Promise<string | null> | null = null;
const formToken = (fresh = false) => {
  if (!ftPromise || fresh) ftPromise = fetch("/api/subscribe", { cache: "no-store" }).then((r) => r.json()).then((j) => (typeof j.ft === "string" ? j.ft : null)).catch(() => null);
  return ftPromise;
};
export default function NewsletterForm({ source, placement = "end" }: { source?: string; placement?: string }) {
  const id = useId();
  const tp = { source: source ?? "unknown", placement };
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  useEffect(() => { formToken(); }, []);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading"); setMsg(""); track("newsletter_submit", tp);
    try {
      const ft = (await formToken()) ?? (await formToken(true));
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), company: f.get("company"), source, ft, attribution: (() => { try { return JSON.parse(sessionStorage.getItem("ba_attr") ?? "{}"); } catch { return {}; } })() }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { track("newsletter_success", tp); setState("ok"); setMsg(j.message ?? "Thanks! Check your inbox for a link to confirm your subscription."); }
      else { track("newsletter_error", { ...tp, error: String(r.status) }); setState("error"); setMsg(j.error ?? "Something went wrong. Please try again."); }
    } catch { track("newsletter_error", { ...tp, error: "network" }); setState("error"); setMsg("Network error. Please try again."); }
  }
  if (state === "ok") return <p role="status" className="mt-3 rounded-lg bg-green-tint p-3 text-sm font-medium text-green">✓ {msg}</p>;
  return <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row" noValidate>
    <label htmlFor={id} className="sr-only">Email address</label>
    <input id={id} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="min-h-11 flex-1 rounded-md border-[1.5px] border-ink bg-white px-3 py-2" />
    {/* honeypot: hidden from people, bots fill it */}
    <input name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <button type="submit" disabled={state === "loading"} className="min-h-11 rounded-md bg-green px-4 py-2 font-semibold text-white hover:bg-green-dark disabled:opacity-60">{state === "loading" ? "Subscribing…" : "Subscribe"}</button>
    {state === "error" && <p role="alert" className="text-sm text-rust sm:basis-full">{msg}</p>}
  </form>;
}
