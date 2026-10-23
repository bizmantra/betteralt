import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, Btn, Src, Sample } from "../../_ui";
import { tool, fmt } from "../../_data";
import { USE_CASES } from "../../_usecases";
import { UCCard } from "../../UseCaseGrid";
import { CopyBox } from "../../_copy";
import LessonPlan from "../../LessonPlan";
import ReportCard from "../../ReportCard";
import EmailBuilder from "../../EmailBuilder";
import Signup from "../../Signup";

type Pick = { slug?: string; name: string; why: string; cost: string; price?: string; src: string; date: string; sample?: boolean; claim?: string };
const fromDb = (slug: string, why: string, cost: string): Pick => { const t = tool(slug); return { slug, name: t.name, why, cost, price: t.pricing.summary ?? undefined, src: t.pricing.sourceUrl, date: fmt(t.pricing.lastChecked) }; };
type D = { title: string; problem: string; outcome: string; toolName: string; tool: ReactNode; steps: string[]; picks: Pick[]; prompts: { label: string; text: string }[]; watch: ReactNode[]; faq: [string, string][]; related: string[] };
const NAMES = <><b>Leave out real names.</b> Don&apos;t paste student names, client names or personal details into an AI chat. Use placeholders like [Name] and fill them in yourself.</>;
const WRONG = <><b>AI can be wrong.</b> It can make up facts or details. Read every word before you use it. You are responsible for what you send or hand out.</>;
const PAGES: Record<string, D> = {
  "plan-a-lesson": {
    title: "Plan a lesson", problem: "Planning a lesson from scratch takes time you don't have, and a blank page makes it slower.",
    outcome: "A timed lesson plan with an objective, warm-up, main activity, a quick check and a wrap-up, ready to print. Plus a prompt to let AI fill in the details.",
    toolName: "Lesson plan builder", tool: <LessonPlan/>,
    steps: ["Pick the grade, subject, topic and lesson length in the builder above.", "Print the outline, or copy the prompt.", "Paste the prompt into free ChatGPT or Gemini to fill in each section.", "Read it through and change anything that doesn't fit your class.", "Save it so you can reuse it next year."],
    picks: [fromDb("chatgpt", "Easy to use with our prompt.", "Free plan works for this."), fromDb("gemini", "Handy if you use Google Docs.", "Free plan works for this."), fromDb("magicschool", "Made for lesson planning, no prompt needed.", "Free plan works for this.")],
    prompts: [{ label: "Make it easier or harder", text: "Rewrite this lesson plan with an extra activity for students who need more help and a challenge for students who finish early. Keep the same timings.\n\n[paste your lesson plan]" }],
    watch: [NAMES, WRONG, <><b>Check your school&apos;s rules.</b> Some schools only allow approved AI tools.</>],
    faq: [["Is the builder really free?", "Yes. It runs in your browser, needs no sign-up, and we don't save what you type."], ["Do I need to pay for ChatGPT?", "No. The free plan works for this prompt."], ["Can I edit the plan?", "Yes. Download it as text and edit it in any app, or print it and write on it."]],
    related: ["write-report-card-comments", "make-a-quiz-from-a-pdf", "make-a-rubric"],
  },
  "write-report-card-comments": {
    title: "Write report card comments", problem: "Writing a fresh, kind and specific comment for every student takes hours, and they start to sound the same.",
    outcome: "Three ready-to-edit comments built from the strengths and next steps you pick, in the tone you want. Swap [Name] for the real name in your report system.",
    toolName: "Report card comment builder", tool: <ReportCard/>,
    steps: ["Pick the student's strengths and one or two things to work on.", "Choose a tone: warm, formal or encouraging.", "Copy the comment you like best, or press 'Mix up the wording' for new versions.", "Paste it into your report system and replace [Name] there.", "Add one detail only you know, so it sounds like you."],
    picks: [fromDb("chatgpt", "Good for extra variety using our prompt.", "Free plan works for this."), fromDb("claude", "Writes in a calm, natural style.", "Free plan works for this."), fromDb("magicschool", "Has report card tools made for this job.", "Free plan works for this.")],
    prompts: [{ label: "Turn your notes into a comment", text: "Turn these notes into a 3-sentence report card comment. Use [Name] instead of the name. Be warm and specific and end with one next step.\nNotes: [your short notes]" }, { label: "Make it shorter", text: "Shorten this report card comment to 2 sentences without losing the next step:\n[paste comment]" }],
    watch: [NAMES, WRONG, <><b>Keep it fair.</b> Don&apos;t paste grades, special needs or behaviour records into an AI chat. Check your school&apos;s data rules.</>],
    faq: [["Does this use AI?", "No. The builder puts together sentences we wrote, in your browser. Nothing is sent anywhere."], ["Why [Name] and not the real name?", "So no student details go into a website or an AI tool. Add the name in your own report system."], ["Will every comment look the same?", "Press 'Mix up the wording' for new versions, and add one detail of your own to each."]],
    related: ["plan-a-lesson", "give-feedback-on-an-essay", "make-a-rubric"],
  },
  "write-a-professional-email": {
    title: "Write a follow-up email to a client", problem: "You know what you want to say, but getting the wording polite, clear and short takes longer than it should.",
    outcome: "A polished email with a subject line, your key points and one clear ask, ready to paste into your inbox. Plus a prompt if you want AI to polish it more.",
    toolName: "Email builder", tool: <EmailBuilder/>,
    steps: ["Choose what the email is for, such as a follow-up or a payment reminder.", "Add the first name and your key points, one per line.", "Pick a tone: friendly, professional or short.", "Copy the draft into your email and read it once more.", "Want it smoother? Copy the prompt into free ChatGPT."],
    picks: [fromDb("chatgpt", "Quick polishing with our prompt.", "Free plan works for this."), fromDb("claude", "Natural, calm wording.", "Free plan works for this."), fromDb("grammarly", "Fixes tone and mistakes as you type.", "Free plan works for basic checks."), fromDb("gemini", "Handy if you already use Gmail and Google Docs.", "Free plan works for this.")],
    prompts: [{ label: "Make it friendlier", text: "Make this email warmer and friendlier, but keep it under 120 words and keep the ask:\n[paste email]" }, { label: "Reply to a client", text: "Write a polite reply to this email. My answer is: [your answer]. Keep it short.\n[paste their email]" }],
    watch: [NAMES, WRONG, <><b>Don&apos;t paste private details.</b> Leave out bank details, contracts and anything confidential when you use an AI chat.</>],
    faq: [["Does the builder send my email?", "No. It only writes a draft on your screen. You copy it into your own email."], ["Is it free?", "Yes, with no sign-up. We don't save what you type."], ["Can I use it for other emails?", "Yes. Pick the closest purpose and change your key points."]],
    related: ["draft-a-client-letter", "reply-to-a-review", "write-a-newsletter"],
  },
};
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(PAGES).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: `${PAGES[slug]?.title ?? "Use case"} with AI (prototype)` }; }
const H2 = ({ id, children }: { id: string; children: ReactNode }) => <h2 id={id} className="font-serif text-3xl">{children}</h2>;
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const d = PAGES[slug]; if (!d) notFound();
  return <main>
    <section className="bg-[#FDF3EC]"><div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm text-ink-2"><Link href="/proto">Home</Link> › <Link href="/proto/use-cases">Use cases</Link> › {d.title}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{d.title}</h1>
      <p className="mt-3 max-w-3xl text-lg"><b>The problem:</b> {d.problem}</p>
      <p className="mt-2 max-w-3xl text-lg"><b>What you get:</b> {d.outcome}</p>
      <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 text-sm font-medium text-green-dark"><Icon n="check" c="h-4 w-4"/>Free tool below · runs in your browser · nothing saved</p>
    </div></section>
    <div className="mx-auto max-w-6xl space-y-14 px-5 pt-10">
      <section aria-labelledby="tool" className="rounded-2xl border-2 border-ink bg-white p-6"><H2 id="tool">{d.toolName}</H2><div className="mt-5">{d.tool}</div></section>
      <div className="grid gap-14 lg:grid-cols-[2fr_1fr]"><div className="space-y-14">
        <section aria-labelledby="how"><H2 id="how">How to do it, step by step</H2>
          <ol className="mt-4 space-y-3">{d.steps.map((s, i) => <li key={s} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDF3EC] font-semibold">{i + 1}</span><span className="pt-1">{s}</span></li>)}</ol></section>
        <section aria-labelledby="best"><H2 id="best">Best AI tools for this</H2>
          <p className="mt-1 text-ink-2">Costs come from each company&apos;s own pricing page. <Sample>Our picks are not yet backed by a hands-on test</Sample></p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{d.picks.map((p, i) => <div key={p.name} className={`rounded-xl bg-white p-5 ${i === 0 ? "border-2 border-ink" : "border border-rule"}`}>
            {i === 0 && <p className="text-sm font-semibold text-rust">The one we&apos;d use</p>}
            <h3 className="text-xl font-semibold">{p.name}</h3><p className="text-ink-2">{p.why}</p>
            <p className="mt-2 font-semibold text-green-dark">{p.cost}</p>{p.price && <p className="text-sm">{p.price}</p>}<Src href={p.src} date={p.date}/>
            {i === 0 && p.slug && <div className="mt-3"><Btn href={tool(p.slug).url} ext>Open {p.name} ↗</Btn></div>}</div>)}</div></section>
        <section aria-labelledby="pr"><H2 id="pr">Prompts you can copy</H2><div className="mt-4 space-y-5">{d.prompts.map((p) => <div key={p.label}><h3 className="mb-2 font-semibold">{p.label}</h3><CopyBox text={p.text}/></div>)}</div></section>
        <section aria-labelledby="watch" className="rounded-xl border border-rule bg-[#F3F1EC] p-6"><H2 id="watch">Watch out for</H2>
          <ul className="mt-4 space-y-4">{d.watch.map((w, i) => <li key={i} className="flex gap-3"><Icon n={i === 0 ? "lock" : "warn"} c="h-6 w-6 shrink-0"/><span>{w}</span></li>)}</ul></section>
        <section aria-labelledby="faq"><H2 id="faq">Questions people ask</H2><div className="mt-4 divide-y divide-rule rounded-xl border border-rule bg-white">{d.faq.map(([q, a]) => <details key={q} className="p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-ink-2">{a}</p></details>)}</div></section>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start"><h2 className="font-serif text-2xl">Related</h2>{d.related.map((s) => { const u = USE_CASES.find((x) => x.slug === s)!; return <UCCard key={s} u={u}/>; })}
        <Link href="/proto/use-cases" className="block font-semibold text-green underline">See all use cases →</Link></aside></div>
      <section className="text-sm text-ink-2" aria-labelledby="src"><h2 id="src" className="font-serif text-2xl text-ink">Sources</h2><ul className="mt-2 list-disc space-y-1 pl-5">{d.picks.map((p) => <li key={p.name}>{p.name} pricing: <a className="underline" href={p.src} target="_blank" rel="noopener nofollow">{p.src}</a>, checked {p.date}</li>)}</ul></section>
      <Signup/>
    </div>
  </main>;
}
