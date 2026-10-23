import Link from "next/link";
import { Icon, Card, Sample, Src, Watch, Btn } from "../../../_ui";
import { tool, fmt } from "../../../_data";
import Signup from "../../../Signup";
import CopyPrompt from "./CopyPrompt";
export default function Quizzes() {
  const ms = tool("magicschool"), gpt = tool("chatgpt"), gem = tool("gemini"), kh = tool("khanmigo");
  return <main>
    <section className="bg-[#FDECE4]"><div className="mx-auto max-w-4xl px-5 py-10">
      <p className="text-sm text-ink-2"><Link href="/proto">Home</Link> › <Link href="/proto/for/teachers">For teachers</Link> › Quizzes</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Make a quiz from your lesson with AI</h1>
      <p className="mt-3 text-lg">In about 10 minutes you&apos;ll have a 10-question quiz with an answer key, ready to print or put in Google Forms.</p>
      <p className="mt-3 flex flex-wrap gap-x-5 font-mono text-sm"><span>⏱ About 10 min</span><span>Easy</span><span>Free plan works</span></p>
    </div></section>
    <div className="mx-auto max-w-4xl space-y-12 px-5 pt-10">
      <section aria-labelledby="out"><div className="flex flex-wrap items-center gap-3"><h2 id="out" className="font-serif text-3xl">What you&apos;ll end up with</h2><Sample>Sample result — written by us to show the format, not output from a tool test</Sample></div>
        <Card c="mt-4"><p className="font-semibold">Year 7 Science · Photosynthesis · 10 questions</p>
          <ol className="mt-3 list-decimal space-y-2 pl-6">
            <li>What gas do plants take in for photosynthesis? a) Oxygen b) Carbon dioxide c) Nitrogen</li>
            <li>Where in the leaf does photosynthesis mostly happen? a) Roots b) Chloroplasts c) Stem</li>
            <li>True or false: plants make glucose during photosynthesis.</li>
            <li className="text-ink-2">…7 more questions</li></ol>
          <p className="mt-3 rounded-lg bg-paper p-3 text-sm"><b>Answer key:</b> 1 b · 2 b · 3 True · …</p></Card></section>

      <section aria-labelledby="pick"><h2 id="pick" className="font-serif text-3xl">The tool we&apos;d use</h2>
        <Card c="mt-4 border-2 border-ink"><div className="flex flex-wrap items-start justify-between gap-4"><div>
          <h3 className="text-2xl font-semibold">{ms.name}</h3><p className="text-ink-2">{ms.description}</p></div><Btn href={ms.url} ext>Open {ms.name} ↗</Btn></div>
          <p className="mt-4 text-xl font-semibold text-green-dark">Free plan works for this.</p>
          <p className="text-ink-2">{ms.name} is free for teachers. If you want more, Plus costs $8.33 a month billed yearly, or $12.99 paid monthly.</p>
          <Src href={ms.pricing.sourceUrl} date={fmt(ms.pricing.lastChecked)}/>
          <p className="mt-4"><b>Why:</b> it&apos;s built for teachers, so you don&apos;t have to write a prompt. <b>Skip it if</b> your school has already approved a different tool.</p>
          <p className="mt-2"><Sample>Our pick is not yet backed by a hands-on test</Sample></p></Card></section>

      <section aria-labelledby="steps"><h2 id="steps" className="font-serif text-3xl">Step by step</h2>
        <ol className="mt-4 space-y-3">{["Open your lesson notes or the textbook page you taught from.", "Copy the prompt below and fill in the [brackets]. No student names.", "Paste it into MagicSchool, or into free ChatGPT or Gemini.", "Read every question and the answer key. Fix anything wrong.", "Print it, or copy it into Google Forms for auto-marking."].map((s, i) =>
          <li key={s} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDECE4] font-semibold">{i + 1}</span><span className="pt-1">{s}</span></li>)}</ol></section>

      <section aria-labelledby="pr"><h2 id="pr" className="font-serif text-3xl">Copy the prompt</h2><CopyPrompt/></section>

      <Watch extra={<li className="flex gap-3"><Icon n="school" c="h-6 w-6 shrink-0"/><span><b>Check it matches what you taught.</b> AI may add things your class hasn&apos;t covered. Remove them.</span></li>}/>

      <section aria-labelledby="oth"><h2 id="oth" className="font-serif text-3xl">Other options</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[[gpt, "Good if you already use it. Paste our prompt."], [gem, "Handy if your school uses Google. Works with Google Forms."], [kh, "Free for teachers, from Khan Academy."]].map(([t, why]) => { const x = t as typeof gpt; return <Card key={x.slug}>
            <h3 className="text-xl font-semibold">{x.name}</h3><p className="text-ink-2">{why as string}</p><p className="mt-2 font-semibold text-green-dark">Free plan works for this.</p><p className="text-sm">{x.pricing.summary}</p><Src href={x.pricing.sourceUrl} date={fmt(x.pricing.lastChecked)}/></Card>; })}
          <Card><h3 className="text-xl font-semibold">Eduaide</h3><p className="text-ink-2">Teacher tool with quiz and game makers.</p><p className="mt-2 font-semibold text-green-dark">Free plan works for a few quizzes a month.</p><p className="text-sm">Eduaide says its free plan gives &quot;24 credits a month&quot;, up to 8 resources. Pro is $49.99 a year.</p><Src href="https://www.eduaide.ai/pricing" date="23 Oct 2026"/></Card>
        </div></section>

      <section aria-labelledby="src" className="text-sm text-ink-2"><h2 id="src" className="font-serif text-2xl text-ink">Sources</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">{[ms, gpt, gem, kh].map((t) => <li key={t.slug}>{t.name} pricing: <a className="underline" href={t.pricing.sourceUrl} target="_blank" rel="noopener nofollow">{t.pricing.sourceUrl}</a>, checked {fmt(t.pricing.lastChecked)}</li>)}
          <li>Eduaide pricing: <a className="underline" href="https://www.eduaide.ai/pricing" target="_blank" rel="noopener nofollow">https://www.eduaide.ai/pricing</a>, checked 23 Oct 2026</li></ul></section>
      <Signup/>
    </div>
  </main>;
}
