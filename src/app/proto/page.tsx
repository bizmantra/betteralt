import Link from "next/link";
import { Icon, Card } from "./_ui";
import HomeSearch from "./HomeSearch";
import Signup from "./Signup";
const PERSONAS = [
  { n: "A teacher", i: "apple", jobs: ["Make a quiz", "Plan a lesson", "Write report card comments"], href: "/proto/for/teachers", tint: "bg-[#FDECE4]" },
  { n: "A small business", i: "shop", jobs: ["Write customer emails", "Make a flyer", "Answer reviews"], tint: "bg-[#E2F3F1]" },
  { n: "A student", i: "book", jobs: ["Make a study guide", "Turn notes into flashcards", "Cite a source"], tint: "bg-[#E4EFFA]" },
  { n: "A lawyer", i: "scales", jobs: ["Summarise a document", "Draft a client letter", "Keep client data private"], tint: "bg-[#F0E8F4]" },
];
export default function Home() {
  return <main className="mx-auto max-w-6xl px-5">
    <section className="py-14">
      <p className="font-medium text-rust">AI for your job, in plain English</p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Get today&apos;s work done faster with AI. No tech skills needed.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">Pick your job and your task. You get a ready-to-use template, the tool that fits, and an honest answer on what it costs.</p>
      <HomeSearch/>
    </section>
    <section aria-labelledby="iam"><h2 id="iam" className="font-serif text-3xl">I am…</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{PERSONAS.map((p) => {
        const body = <div className={`h-full rounded-xl p-5 ${p.tint} ${p.href ? "border-2 border-ink" : "border border-rule opacity-70"}`}>
          <Icon n={p.i} c="h-9 w-9"/><h3 className="mt-3 text-xl font-semibold">{p.n}</h3>
          <ul className="mt-2 space-y-1 text-[15px] text-ink-2">{p.jobs.map((j) => <li key={j}>{j}</li>)}</ul>
          <p className="mt-3 text-sm font-semibold">{p.href ? "See teacher jobs →" : "Coming soon"}</p></div>;
        return p.href ? <Link key={p.n} href={p.href}>{body}</Link> : <div key={p.n} aria-disabled>{body}</div>;
      })}</div>
      <p className="mt-4 text-sm text-ink-2">Building with AI? <Link href="/alternatives/base44" className="underline">Compare AI tools and alternatives →</Link></p>
    </section>
    <section className="mt-14" aria-labelledby="pt"><h2 id="pt" className="font-serif text-3xl">Templates to start with</h2><p className="text-ink-2">Picked by us to start with. Each one works in free ChatGPT or Gemini.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Link href="/proto/templates/lesson-plan"><Card c="h-full hover:border-ink"><p className="text-sm font-medium text-rust">Teachers</p><h3 className="mt-1 text-xl font-semibold">Lesson plan template</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-paper p-3 font-mono text-xs text-ink-2">{"Objective: …\nWarm-up (5 min): …\nMain activity (25 min): …\nCheck for understanding: …"}</pre><p className="mt-3 font-semibold text-green">Open template →</p></Card></Link>
        <Link href="/proto/for/teachers/quizzes"><Card c="h-full hover:border-ink"><p className="text-sm font-medium text-rust">Teachers</p><h3 className="mt-1 text-xl font-semibold">Quiz from your lesson</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-paper p-3 font-mono text-xs text-ink-2">{"1. What gas do plants take in?\n   a) Oxygen  b) Carbon dioxide ✓\n…\nAnswer key included"}</pre><p className="mt-3 font-semibold text-green">See how →</p></Card></Link>
        <Card c="h-full opacity-70"><p className="text-sm font-medium text-rust">Teachers</p><h3 className="mt-1 text-xl font-semibold">Report card comments</h3><p className="mt-3 text-ink-2">Coming next.</p></Card>
      </div>
    </section>
    <section className="mt-14 rounded-xl border border-rule bg-white p-6" aria-labelledby="tr"><h2 id="tr" className="font-serif text-2xl">How we help, honestly</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["check", "Costs checked against each company's own pricing page, with the date"], ["lock", "A privacy and accuracy note on every task"], ["school", "Plain words. No tech jargon."], ["grid", "No company pays for our picks. Sponsors are labelled."]].map(([i, t]) =>
          <li key={t} className="flex gap-3"><span className="text-green"><Icon n={i} c="h-6 w-6"/></span><span>{t}</span></li>)}
      </ul></section>
    <div className="mt-14"><Signup/></div>
  </main>;
}
