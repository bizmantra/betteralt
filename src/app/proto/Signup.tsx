"use client";
import { useState } from "react";
import { Icon } from "./_ui";
// MOCK: sends nothing, stores nothing. In production this posts to the existing double opt-in newsletter flow (/newsletter, Resend).
export default function Signup({ compact }: { compact?: boolean }) {
  const [done, setDone] = useState(false);
  return <section className="rounded-2xl border border-rule bg-white p-7 shadow-sm" aria-labelledby="su" data-testid="signup">
    <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-[1.2fr_1fr]"} md:items-center`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green">Optional · free account</p>
        <h2 id="su" className="mt-1 text-2xl font-semibold tracking-tight">Get extra access</h2>
        <p className="mt-1 text-ink-2">Every tool works without signing up. An account adds:</p>
        <ul className="mt-3 space-y-1.5 text-sm">{["Save your outputs and come back to them", "More runs of each tool", "A free template pack, sent by email", "A note when a tool you use changes its free plan"].map((t) =>
          <li key={t} className="flex gap-2"><span className="text-green"><Icon n="check" c="h-5 w-5"/></span>{t}</li>)}</ul>
      </div>
      {done ? <p role="status" className="flex items-center gap-2 rounded-xl bg-green-tint p-4 font-medium text-green-dark"><Icon n="check" c="h-6 w-6"/>Check your inbox and click the link to confirm. (Prototype: nothing was sent.)</p>
      : <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <label className="sr-only" htmlFor="em">Email</label>
          <input id="em" type="email" required placeholder="you@example.com" className="w-full rounded-lg border border-rule bg-white px-4 py-3 outline-none focus:border-green"/>
          <button className="w-full rounded-lg bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">Get extra access</button>
          <p className="text-xs text-ink-2">Free. We confirm by email first. Unsubscribe any time.</p>
        </form>}
    </div>
  </section>;
}
