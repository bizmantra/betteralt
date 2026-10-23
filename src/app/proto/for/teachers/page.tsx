import Link from "next/link";
import { Icon, Card, Sample, Watch } from "../../_ui";
import { limits } from "../../_data";
import Signup from "../../Signup";
const JOBS = [
  { t: "Make a quiz from your lesson", o: "A 10-question quiz with an answer key", time: "About 10 min", i: "quiz", href: "/proto/for/teachers/quizzes" },
  { t: "Plan a lesson", o: "A lesson plan you can teach from tomorrow", time: "About 15 min", i: "plan", href: "/proto/templates/lesson-plan" },
  { t: "Write report card comments", o: "Kind, specific comments for each student", time: "Coming soon", i: "pen" },
  { t: "Make a rubric", o: "A clear 4-level marking rubric", time: "Coming soon", i: "grid" },
];
export default function Teachers() {
  return <main>
    <section className="bg-[#FDECE4]"><div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm text-ink-2"><Link href="/proto">Home</Link> › For teachers</p>
      <div className="mt-3 flex items-center gap-4"><span className="text-rust"><Icon n="apple" c="h-12 w-12"/></span><h1 className="font-serif text-4xl sm:text-5xl">AI for teachers</h1></div>
      <p className="mt-3 max-w-2xl text-lg">Save time on planning, quizzes and marking. We tell you which tool to use, what the free plan really gets you, and where it can go wrong.</p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">{["Planning", "Quizzes", "Marking & feedback", "Parents", "Admin"].map((c) => <span key={c} className="rounded-full border border-rule bg-white px-3 py-1">{c}</span>)}</div>
    </div></section>
    <div className="mx-auto max-w-6xl px-5">
      <section className="mt-12" aria-labelledby="jobs"><h2 id="jobs" className="font-serif text-3xl">What do you need to get done?</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{JOBS.map((j) => {
          const b = <Card c={`h-full ${j.href ? "hover:border-ink" : "opacity-60"}`}><div className="flex gap-4"><span className="text-rust"><Icon n={j.i} c="h-8 w-8"/></span><div>
            <h3 className="text-xl font-semibold">{j.t}</h3><p className="text-ink-2">You get: {j.o}</p><p className="mt-2 font-mono text-sm">⏱ {j.time}</p></div></div></Card>;
          return j.href ? <Link key={j.t} href={j.href}>{b}</Link> : <div key={j.t}>{b}</div>; })}</div>
      </section>
      <section className="mt-14" aria-labelledby="lim"><h2 id="lim" className="font-serif text-3xl">What the free plans really get you</h2>
        <p className="mt-1 max-w-3xl text-ink-2">Every tool says &quot;free&quot;, but each one limits something different. Here is what each company&apos;s own pricing page says.</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-rule bg-white"><table className="w-full min-w-[720px] text-left">
          <thead className="bg-paper text-sm"><tr><th className="p-3">Tool</th><th className="p-3">What&apos;s free</th><th className="p-3">If you pay</th><th className="p-3">Checked</th></tr></thead>
          <tbody>{limits.map((r) => <tr key={r.name} className="border-t border-rule align-top">
            <td className="p-3 font-semibold">{r.name}</td>
            <td className="p-3">{r.free}{r.status === "sample" && <div className="mt-1"><Sample/></div>}</td>
            <td className="p-3">{r.paid}</td>
            <td className="p-3 text-sm"><span className="font-mono">{r.checked}</span> · <a className="underline" href={r.source} target="_blank" rel="noopener nofollow">source</a></td></tr>)}</tbody>
        </table></div>
        <p className="mt-2 text-sm text-ink-2">Prices in US dollars. Brisk&apos;s pricing page could not be reached and Quizlet&apos;s blocks our checker, so those rows are not verified.</p>
      </section>
      <section className="mt-14" aria-labelledby="tpl"><h2 id="tpl" className="font-serif text-3xl">Free templates</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Link href="/proto/templates/lesson-plan"><Card c="hover:border-ink"><Icon n="plan"/><h3 className="mt-2 text-xl font-semibold">Lesson plan template</h3><p className="text-ink-2">Fill in 4 blanks. Copy, print or paste into any AI chat.</p></Card></Link>
          <Card c="opacity-60"><Icon n="pen"/><h3 className="mt-2 text-xl font-semibold">Report card comments</h3><p className="text-ink-2">Coming soon</p></Card>
          <Card c="opacity-60"><Icon n="grid"/><h3 className="mt-2 text-xl font-semibold">Rubric</h3><p className="text-ink-2">Coming soon</p></Card>
        </div></section>
      <div className="mt-14"><Watch/></div>
      <div className="mt-14"><Signup/></div>
    </div>
  </main>;
}
