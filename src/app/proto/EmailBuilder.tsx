"use client";
import { useMemo, useState } from "react";
import { useCopy, G, G2, INP } from "./_copy";
// Template-based, fully in the browser. No AI call; nothing stored or sent.
const PURPOSES = {
  "Follow up after a meeting": { subj: "Following up on our conversation", open: "Thank you for taking the time to speak with me", ask: "Could you let me know a good time for a next step?" },
  "Chase an unpaid invoice": { subj: "Friendly reminder: invoice payment", open: "I hope you're well. I'm writing about an invoice that is now due", ask: "Could you let me know when I can expect payment?" },
  "Send a quote": { subj: "Your quote", open: "Thank you for your interest. As promised, here are the details of my quote", ask: "Please let me know if you'd like to go ahead or have any questions." },
  "Say thank you": { subj: "Thank you", open: "I just wanted to say a sincere thank you", ask: "I look forward to working with you again." },
  "Ask for a review": { subj: "Could you share a quick review?", open: "Thank you again for choosing us", ask: "If you have two minutes, a short review would mean a lot to us." },
};
const TONES = { Friendly: { hi: "Hi", bye: "Best wishes" }, Professional: { hi: "Dear", bye: "Kind regards" }, Short: { hi: "Hi", bye: "Thanks" } };
type P = keyof typeof PURPOSES; type T = keyof typeof TONES;
export default function EmailBuilder() {
  const [p, setP] = useState<P>("Follow up after a meeting"), [tone, setTone] = useState<T>("Friendly");
  const [to, setTo] = useState(""), [pts, setPts] = useState(""), [from, setFrom] = useState("");
  const { msg, copy, download } = useCopy();
  const d = PURPOSES[p], t = TONES[tone];
  const points = pts.split("\n").map((x) => x.trim()).filter(Boolean);
  const email = useMemo(() => {
    const body = tone === "Short"
      ? `${d.open}.${points.length ? " " + points.join(". ").replace(/\.?$/, ".") : ""} ${d.ask}`
      : `${d.open}.\n\n${points.length ? (points.length === 1 ? points[0].replace(/\.?$/, ".") : "To recap:\n" + points.map((x) => `- ${x}`).join("\n")) + "\n\n" : ""}${d.ask}`;
    return `Subject: ${d.subj}\n\n${t.hi} ${to.trim() || "[Name]"},\n\n${body}\n\n${t.bye},\n${from.trim() || "[Your name]"}`;
  }, [d, t, tone, to, from, points]);
  const prompt = `Write a ${tone.toLowerCase()} email to ${to.trim() || "[who it's to]"} to ${p.toLowerCase()}.
Key points: ${points.join("; ") || "[your key points]"}.
Keep it under 150 words, clear and polite, with a subject line and one clear ask at the end. Don't add facts I didn't give you.`;
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm ${on ? "border-ink bg-green-tint font-semibold" : "border-rule bg-white"}`;
  return <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
    <section aria-label="Your email details" className="space-y-5">
      <label className="block font-medium">What is the email for?<select data-testid="em-purpose" className={INP} value={p} onChange={(e) => setP(e.target.value as P)}>{Object.keys(PURPOSES).map((k) => <option key={k}>{k}</option>)}</select></label>
      <label className="block font-medium">Who is it to? (first name is fine)<input data-testid="em-to" className={INP} value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Sam"/></label>
      <label className="block font-medium">Key points, one per line<textarea data-testid="em-points" rows={4} className={INP} value={pts} onChange={(e) => setPts(e.target.value)} placeholder={"e.g. We agreed on a 3-month trial\nI'll send the contract on Friday"}/></label>
      <fieldset><legend className="font-medium">Tone</legend><div className="mt-2 flex flex-wrap gap-2">{(Object.keys(TONES) as T[]).map((k) => <button key={k} type="button" aria-pressed={tone === k} onClick={() => setTone(k)} className={chip(tone === k)}>{k}</button>)}</div></fieldset>
      <label className="block font-medium">Your name (optional)<input data-testid="em-from" className={INP} value={from} onChange={(e) => setFrom(e.target.value)}/></label>
    </section>
    <section aria-label="Your draft" className="space-y-4">
      <pre data-testid="em-draft" className="whitespace-pre-wrap rounded-xl border border-rule bg-white p-5 font-sans">{email}</pre>
      <div className="flex flex-wrap gap-3"><button onClick={() => copy(email, "Email")} className={G}>Copy email</button>
        <button onClick={() => download(email + "\n\n---\nAI prompt:\n" + prompt, "email-draft.txt")} className={G2}>Download .txt</button></div>
      <div><h3 className="font-semibold">Want AI to polish it? Paste this into free ChatGPT</h3><pre data-testid="em-prompt" className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-low p-4 font-mono text-sm">{prompt}</pre>
        <button onClick={() => copy(prompt, "Prompt")} className={`${G} mt-3`}>Copy prompt</button></div>
      <p role="status" data-testid="msg" className="min-h-6 text-green-dark">{msg}</p>
    </section>
  </div>;
}
