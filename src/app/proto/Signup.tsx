"use client";
import { useState } from "react";
import { Icon } from "./_ui";
// MOCK: sends nothing, stores nothing. Shows the success state only.
export default function Signup() {
  const [done, setDone] = useState(false);
  return <section className="rounded-2xl bg-[#FDECE4] p-7" aria-labelledby="su">
    <div className="flex items-start gap-4"><span className="text-rust"><Icon n="mail" c="h-9 w-9"/></span><div className="flex-1">
      <h2 id="su" className="font-serif text-2xl">One AI tool for teachers a week, honestly checked</h2>
      <p className="mt-1 text-ink-2">Plus a free pack of tested prompts. We also tell you when a tool you use changes its free plan.</p>
      {done ? <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-green-tint p-4 font-medium text-green-dark"><Icon n="check" c="h-6 w-6"/>Almost done! Check your inbox and click the link to confirm. (Prototype: nothing was sent.)</p>
      : <form className="mt-4 flex flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <label className="sr-only" htmlFor="em">Email</label>
          <input id="em" type="email" required placeholder="you@school.org" className="min-w-0 flex-1 rounded-xl border border-ink bg-white px-4 py-3"/>
          <button className="rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">Send me the pack</button>
          <p className="w-full text-sm text-ink-2">Free. One email a week. Unsubscribe any time.</p>
        </form>}
    </div></div>
  </section>;
}
