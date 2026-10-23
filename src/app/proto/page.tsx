import Link from "next/link";
import { Icon } from "./_ui";
import HomeSearch from "./HomeSearch";
import Signup from "./Signup";
import { USE_CASES } from "./_usecases";
import { UCCard } from "./UseCaseGrid";
export default function Home() {
  const tools = USE_CASES.filter((u) => u.tool), popular = USE_CASES.filter((u) => !u.tool).slice(0, 6);
  return <main className="mx-auto max-w-6xl px-5">
    <section className="py-16 text-center">
      <h1 className="font-serif text-4xl leading-tight sm:text-6xl">What do you need to get done?</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">Search a task. We show you how to do it with AI, the tool that fits, and what it really costs.</p>
      <HomeSearch/>
    </section>
    <section id="free-tools" aria-labelledby="ft"><h2 id="ft" className="font-serif text-3xl">Free tools you can use right now</h2><p className="text-ink-2">No sign-up. They run in your browser and save nothing.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{tools.map((u) => <Link key={u.slug} href={`/proto/use-cases/${u.slug}`} className="rounded-xl border-2 border-ink bg-white p-5 hover:bg-[#FDF3EC]">
        <span className="text-green"><Icon n="pen" c="h-8 w-8"/></span><h3 className="mt-2 text-xl font-semibold">{u.tool}</h3><p className="text-ink-2">{u.title}</p><p className="mt-3 font-semibold text-green">Use it free →</p></Link>)}</div></section>
    <section className="mt-14" aria-labelledby="pop"><div className="flex items-end justify-between"><h2 id="pop" className="font-serif text-3xl">Popular use cases</h2><Link href="/proto/use-cases" className="font-semibold text-green underline">See all {USE_CASES.length} →</Link></div>
      <p className="text-ink-2">Picked by us to start with.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{popular.map((u) => <UCCard key={u.slug} u={u}/>)}</div></section>
    <section className="mt-14 rounded-xl border border-rule bg-white p-6" aria-labelledby="tr"><h2 id="tr" className="font-serif text-2xl">How we help, honestly</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["check", "Costs checked against each company's own pricing page, with the date"], ["lock", "A privacy and accuracy note on every task"], ["school", "Plain words. No tech jargon."], ["grid", "No company pays for our picks"]].map(([i, t]) =>
        <li key={t} className="flex gap-3"><span className="text-green"><Icon n={i} c="h-6 w-6"/></span><span>{t}</span></li>)}</ul></section>
    <div className="mt-14"><Signup/></div>
  </main>;
}
