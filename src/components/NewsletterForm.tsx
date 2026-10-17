"use client";
import { useState, type FormEvent } from "react";
export default function NewsletterForm({ source }: { source?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading"); setMsg("");
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), company: f.get("company"), source }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setState("ok"); setMsg(j.message ?? "You're subscribed. Check your inbox."); }
      else { setState("error"); setMsg(j.error ?? "Something went wrong. Please try again."); }
    } catch { setState("error"); setMsg("Network error. Please try again."); }
  }
  if (state === "ok") return <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">✓ {msg}</p>;
  return <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row" noValidate>
    <label htmlFor="nl-email" className="sr-only">Email address</label>
    <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="flex-1 rounded-lg border bg-white px-3 py-2" />
    {/* honeypot: hidden from people, bots fill it */}
    <input name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <button type="submit" disabled={state === "loading"} className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{state === "loading" ? "Subscribing…" : "Subscribe"}</button>
    {state === "error" && <p role="alert" className="text-sm text-red-700 sm:basis-full">{msg}</p>}
  </form>;
}
