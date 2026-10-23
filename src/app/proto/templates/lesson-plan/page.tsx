import Link from "next/link";
import { Watch, Src } from "../../_ui";
import { tool, fmt } from "../../_data";
import LessonPlan from "./LessonPlan";
export default function Page() {
  const t = ["chatgpt", "gemini", "magicschool"].map(tool);
  return <main>
    <section className="bg-[#FDECE4]"><div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm text-ink-2"><Link href="/proto">Home</Link> › <Link href="/proto/for/teachers">For teachers</Link> › Lesson plan template</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Lesson plan template</h1>
      <p className="mt-3 max-w-2xl text-lg">Fill in four blanks. You get a lesson plan outline to print, plus a prompt to paste into any free AI chat to fill in the details.</p>
      <p className="mt-2 text-sm">Everything stays in your browser. We don&apos;t save or send what you type.</p>
    </div></section>
    <div className="mx-auto max-w-6xl space-y-12 px-5 pt-10">
      <LessonPlan/>
      <section aria-labelledby="ww"><h2 id="ww" className="font-serif text-2xl">Works with these free plans</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">{t.map((x) => <li key={x.slug} className="rounded-xl border border-rule bg-white p-4"><b>{x.name}</b><p className="text-green-dark">Free plan works for this.</p><Src href={x.pricing.sourceUrl} date={fmt(x.pricing.lastChecked)}/></li>)}</ul></section>
      <Watch/>
    </div>
  </main>;
}
