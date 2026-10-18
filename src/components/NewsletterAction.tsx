"use client";
// Confirm / unsubscribe pages: read the signed token from ?t=, then POST it only when the person clicks, so email
// link scanners that prefetch the URL can't confirm or unsubscribe anyone.
import { useEffect, useState } from "react";
import { track } from "@/lib/track";
export default function NewsletterAction({ kind }: { kind: "confirm" | "unsubscribe" }) {
  const [t, setT] = useState<string | null>(null);
  const [erase, setErase] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  useEffect(() => { setT(new URLSearchParams(window.location.search).get("t")); }, []);
  async function go() {
    setState("loading");
    try {
      const r = await fetch(`/api/subscribe/${kind}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(kind === "confirm" ? { t } : { t, erase }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setState("ok"); setMsg(j.message); track(kind === "confirm" ? "newsletter_confirm" : "newsletter_unsubscribe", {}); }
      else { setState("error"); setMsg(j.error ?? "Something went wrong. Please try again."); }
    } catch { setState("error"); setMsg("Network error. Please try again."); }
  }
  if (t === null) return <p className="text-sm text-ink-2">This page needs the link from your email.</p>;
  if (state === "ok") return <p role="status" data-result="ok" className="rounded-lg bg-green-tint p-3 text-sm font-medium text-green">✓ {msg}</p>;
  return <div className="space-y-3">
    {kind === "unsubscribe" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={erase} onChange={(e) => setErase(e.target.checked)} /> Also delete my email address from your list</label>}
    <button type="button" onClick={go} disabled={state === "loading"} data-action={kind} className="min-h-11 rounded-md bg-green px-4 py-2 font-semibold text-white hover:bg-green-dark disabled:opacity-60">
      {state === "loading" ? "Working…" : kind === "confirm" ? "Confirm my subscription" : "Unsubscribe"}</button>
    {state === "error" && <p role="alert" data-result="error" className="text-sm text-rust">{msg}</p>}
  </div>;
}
