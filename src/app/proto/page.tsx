import Link from "next/link";
import { Icon } from "./_ui";
import HomeSearch from "./HomeSearch";
import Signup from "./Signup";
import { USE_CASES } from "./_usecases";
import { withSeo } from "./_seo";
import { UCCard } from "./UseCaseGrid";
import { CATS, inCat, href, type CatSlug } from "./_money";
export default function Home() {
  const order = withSeo().sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).map((u) => u.slug), popular = USE_CASES.filter((u) => !u.toolName).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)).slice(0, 6);
  return <main className="mx-auto max-w-6xl px-5">
    <section className="py-16 text-center"><p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-rule bg-white px-3 py-1 text-xs font-medium text-ink-2"><span className="h-2 w-2 rounded-full bg-green"/>Free tools · no sign-up needed</p>
      <h1 className="font-serif font-semibold tracking-tight text-4xl leading-tight sm:text-6xl">What do you need to <span className="text-green">get done?</span></h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">Search a task. We show you how to do it with AI, the tool that fits, and what it really costs.</p>
      <HomeSearch/>
    </section>
    <section id="jobs" aria-labelledby="jb" data-testid="home-cats"><h2 id="jb" className="text-3xl font-semibold tracking-tight">Start with a job</h2><p className="text-ink-2">Free tools and templates, grouped by the work they help with. No sign-up.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{(Object.keys(CATS) as CatSlug[]).map((k) => <div key={k} className="rounded-2xl border border-rule bg-white p-6 shadow-sm">
        <Link href={`/proto/${k}`} className="flex items-center gap-3 hover:text-green"><span className="inline-flex rounded-lg bg-green-tint p-2 text-green"><Icon n={CATS[k].icon} c="h-6 w-6"/></span><h3 className="text-2xl font-semibold">{CATS[k].name}</h3></Link>
        <p className="mt-2 text-ink-2">{CATS[k].intro}</p>
        <ul className="mt-4 grid gap-x-4 gap-y-1 sm:grid-cols-2">{inCat(k).map((m) => <li key={m.slug}><Link className="text-green-dark hover:underline" href={href(m)}>{m.h1}</Link></li>)}</ul>
        <Link href={`/proto/${k}`} className="mt-4 inline-block font-semibold text-green">See all {CATS[k].name.toLowerCase()} tools →</Link></div>)}</div></section>
    <section className="mt-14" aria-labelledby="pop"><div className="flex items-end justify-between"><h2 id="pop" className="font-serif font-semibold tracking-tight text-3xl">Popular use cases</h2><Link href="/proto/use-cases" className="font-semibold text-green underline">See all {USE_CASES.length} →</Link></div>
      <p className="text-ink-2">Picked by us to start with.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{popular.map((u) => <UCCard key={u.slug} u={u}/>)}</div></section>
    <section className="mt-14 rounded-xl border border-rule bg-white p-6" aria-labelledby="tr"><h2 id="tr" className="font-serif font-semibold tracking-tight text-2xl">How we help, honestly</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["check", "Costs checked against each company's own pricing page, with the date"], ["lock", "A privacy and accuracy note on every task"], ["school", "Plain words. No tech jargon."], ["grid", "No company pays for our picks"]].map(([i, t]) =>
        <li key={t} className="flex gap-3"><span className="text-green"><Icon n={i} c="h-6 w-6"/></span><span>{t}</span></li>)}</ul></section>
    <div className="mt-14"><Signup/></div>
  </main>;
}
