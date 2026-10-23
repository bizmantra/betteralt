"use client";
import { useMemo, useState } from "react";
// Entirely client-side. No AI call, no analytics, nothing stored.
const GRADES = ["Kindergarten", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const DUR = [30, 40, 45, 60, 90];
export default function LessonPlan() {
  const [grade, setGrade] = useState("Grade 7");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [mins, setMins] = useState(45);
  const [msg, setMsg] = useState("");
  const S = subject.trim() || "[subject]", T = topic.trim() || "[topic]";
  const parts = useMemo(() => { const w = Math.max(5, Math.round(mins * 0.1)), c = Math.max(5, Math.round(mins * 0.15)), m = mins - w - c - 5; return { w, m, c }; }, [mins]);
  const prompt = `Act as an experienced ${grade} ${S} teacher. Write a ${mins}-minute lesson plan on "${T}".
Include: 1 clear learning objective, a ${parts.w}-minute warm-up, a ${parts.m}-minute main activity with step-by-step teacher instructions, a ${parts.c}-minute check for understanding with 3 questions and answers, a 5-minute wrap-up, a materials list, and one idea for students who need extra help and one for students who finish early.
Use simple language suitable for ${grade}. Do not include any student names.`;
  const plan = `LESSON PLAN
${grade} · ${S} · ${T} · ${mins} minutes

Learning objective
By the end of this lesson, students will be able to: ____________________

Materials
- ____________________

1. Warm-up (${parts.w} min)
   ____________________

2. Main activity (${parts.m} min)
   ____________________

3. Check for understanding (${parts.c} min)
   Q1 ________  Q2 ________  Q3 ________

4. Wrap-up (5 min)
   ____________________

Extra help: ____________________
Finished early: ____________________`;
  const copy = async (s: string, what: string) => { try { await navigator.clipboard.writeText(s); setMsg(`${what} copied`); } catch { setMsg("Copy blocked. Select the text and press Ctrl/⌘+C."); } };
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([plan + "\n\n---\nAI prompt:\n" + prompt], { type: "text/plain" })); a.download = "lesson-plan.txt"; a.click(); URL.revokeObjectURL(a.href); setMsg("Downloaded lesson-plan.txt"); };
  const inp = "mt-1 w-full rounded-xl border border-ink bg-white px-4 py-3";
  return <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
    <section aria-labelledby="fill" className="print:hidden"><h2 id="fill" className="font-serif font-semibold tracking-tight text-2xl">1. Fill in the blanks</h2>
      <div className="mt-4 space-y-4">
        <label className="block font-medium">Grade<select data-testid="grade" className={inp} value={grade} onChange={(e) => setGrade(e.target.value)}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label className="block font-medium">Subject<input data-testid="subject" className={inp} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Science"/></label>
        <label className="block font-medium">Topic<input data-testid="topic" className={inp} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Photosynthesis"/></label>
        <fieldset><legend className="font-medium">How long is the lesson?</legend><div className="mt-2 flex flex-wrap gap-2">{DUR.map((d) =>
          <button key={d} type="button" aria-pressed={mins === d} onClick={() => setMins(d)} className={`rounded-full border px-4 py-2 ${mins === d ? "border-ink bg-surface-low font-semibold" : "border-rule bg-white"}`}>{d} min</button>)}</div></fieldset>
        <p className="rounded-lg bg-surface-low p-3 text-sm">🔒 No student names here or in your AI chat.</p>
      </div></section>
    <section aria-labelledby="res" className="space-y-6"><h2 id="res" className="font-serif font-semibold tracking-tight text-2xl print:hidden">2. Your lesson plan</h2>
      <pre data-testid="plan" className="whitespace-pre-wrap rounded-xl border border-rule bg-white p-5 font-mono text-sm">{plan}</pre>
      <div className="flex flex-wrap gap-3 print:hidden">
        <button onClick={() => copy(plan, "Lesson plan")} className="rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">Copy plan</button>
        <button onClick={download} className="rounded-xl border-2 border-green px-5 py-3 font-semibold text-green">Download .txt</button>
        <button onClick={() => window.print()} className="rounded-xl border-2 border-green px-5 py-3 font-semibold text-green">Print</button>
      </div>
      <div className="print:hidden"><h3 className="text-lg font-semibold">3. Want AI to fill it in? Paste this prompt into free ChatGPT or Gemini</h3>
        <pre data-testid="prompt" className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-low p-5 font-mono text-sm">{prompt}</pre>
        <button onClick={() => copy(prompt, "Prompt")} className="mt-3 rounded-xl bg-green px-5 py-3 font-semibold text-white hover:bg-green-dark">Copy prompt</button></div>
      <p role="status" data-testid="msg" className="min-h-6 text-green-dark">{msg}</p>
    </section>
  </div>;
}
