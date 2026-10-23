"use client";
import { useMemo, useState } from "react";
import { useCopy, G, G2, INP } from "./_copy";
// Template-based, fully in the browser. No AI call; nothing stored or sent.
const STRENGTHS: Record<string, [string, string]> = {
  "Works hard": ["works hard in every lesson", "puts real effort into every task"],
  "Kind to others": ["is kind and helpful to classmates", "makes others feel welcome"],
  "Takes part in class": ["takes an active part in class discussions", "shares ideas with confidence"],
  "Strong reader": ["reads with growing fluency and understanding", "enjoys reading and talks about books well"],
  "Good at maths": ["shows a strong grasp of number work", "solves maths problems carefully"],
  "Creative": ["brings creative ideas to their work", "thinks of original ways to solve problems"],
  "Organised": ["is well organised and ready to learn", "manages time and materials well"],
};
const GROW: Record<string, [string, string]> = {
  "Homework on time": ["handing in homework on time", "keeping up with homework each week"],
  "Focus in class": ["staying focused during independent work", "keeping attention on the task for longer"],
  "Neat handwriting": ["writing more neatly", "taking care with presentation"],
  "Asking for help": ["asking for help when unsure", "speaking up when something is unclear"],
  "Checking work": ["checking work before handing it in", "reading back over answers to catch small mistakes"],
  "Times tables": ["learning times tables by heart", "practising number facts at home"],
};
const TONES = { Warm: ["It has been a pleasure to teach [Name] this term.", "Well done, [Name]. Keep it up!"], Formal: ["[Name] has made steady progress this term.", "I look forward to seeing [Name] build on this next term."], Encouraging: ["[Name] should feel proud of this term.", "With a little extra practice, [Name] will go even further."] };
type Tone = keyof typeof TONES;
const join = (a: string[]) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
export default function ReportCard() {
  const [s, setS] = useState<string[]>(["Works hard", "Kind to others"]), [g, setG] = useState<string[]>(["Homework on time"]);
  const [tone, setTone] = useState<Tone>("Warm"), [subject, setSubject] = useState(""), [v, setV] = useState(0);
  const { msg, copy, download } = useCopy();
  const tog = (list: string[], set: (x: string[]) => void, k: string) => set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);
  const comments = useMemo(() => [0, 1, 2].map((i) => {
    const o = (i + v) % 2; const subj = subject.trim() ? ` in ${subject.trim()}` : "";
    const st = s.length ? `[Name] ${join(s.map((k) => STRENGTHS[k][o]))}${subj}.` : `[Name] has worked steadily${subj} this term.`;
    const gr = g.length ? ` A next step is ${join(g.map((k) => GROW[k][(o + i) % 2]))}.` : "";
    const [open, close] = TONES[tone];
    return i === 0 ? `${open} ${st}${gr} ${close}` : i === 1 ? `${st}${gr} ${close}` : `${open} ${st}${gr}`;
  }), [s, g, tone, subject, v]);
  const prompt = `Write 3 short report card comments (2–3 sentences each) in a ${tone.toLowerCase()} tone${subject ? ` for ${subject}` : ""}. Use "[Name]" instead of the student's name.
Strengths: ${s.join(", ") || "[strengths]"}. Areas to improve: ${g.join(", ") || "[areas to improve]"}.
Be specific and kind, and end with one clear next step. Do not invent grades or facts.`;
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm ${on ? "border-ink bg-green-tint font-semibold" : "border-rule bg-white"}`;
  return <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
    <section aria-label="Your notes" className="space-y-5">
      <fieldset><legend className="font-medium">Strengths (pick any)</legend><div className="mt-2 flex flex-wrap gap-2">{Object.keys(STRENGTHS).map((k) => <button key={k} type="button" aria-pressed={s.includes(k)} onClick={() => tog(s, setS, k)} className={chip(s.includes(k))}>{k}</button>)}</div></fieldset>
      <fieldset><legend className="font-medium">Areas to improve</legend><div className="mt-2 flex flex-wrap gap-2">{Object.keys(GROW).map((k) => <button key={k} type="button" aria-pressed={g.includes(k)} onClick={() => tog(g, setG, k)} className={chip(g.includes(k))}>{k}</button>)}</div></fieldset>
      <fieldset><legend className="font-medium">Tone</legend><div className="mt-2 flex flex-wrap gap-2">{(Object.keys(TONES) as Tone[]).map((t) => <button key={t} type="button" aria-pressed={tone === t} onClick={() => setTone(t)} className={chip(tone === t)}>{t}</button>)}</div></fieldset>
      <label className="block font-medium">Subject (optional)<input data-testid="rc-subject" className={INP} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Science"/></label>
      <p className="rounded-lg bg-surface-low p-3 text-sm">🔒 We use [Name] on purpose. Add the real name only in your own report system, never in an AI chat.</p>
    </section>
    <section aria-label="Your comments" className="space-y-4">
      {comments.map((c, i) => <div key={i} className="rounded-xl border border-rule bg-white p-4"><p data-testid="rc-comment">{c}</p><button onClick={() => copy(c, `Comment ${i + 1}`)} className="mt-2 text-sm font-semibold text-green underline">Copy this one</button></div>)}
      <div className="flex flex-wrap gap-3"><button onClick={() => copy(comments.join("\n\n"), "All comments")} className={G}>Copy all</button>
        <button onClick={() => setV(v + 1)} className={G2}>Mix up the wording</button>
        <button onClick={() => download(comments.join("\n\n") + "\n\n---\nAI prompt:\n" + prompt, "report-card-comments.txt")} className={G2}>Download .txt</button></div>
      <details className="rounded-xl bg-surface-low p-4"><summary className="cursor-pointer font-semibold">Want more variety? Use this prompt in a free AI chat</summary><pre data-testid="rc-prompt" className="mt-3 whitespace-pre-wrap font-mono text-sm">{prompt}</pre><button onClick={() => copy(prompt, "Prompt")} className={`${G} mt-3`}>Copy prompt</button></details>
      <p role="status" data-testid="msg" className="min-h-6 text-green-dark">{msg}</p>
    </section>
  </div>;
}
