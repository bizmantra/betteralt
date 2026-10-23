import Link from "next/link";
import { JsonLd } from "@/components/ui";
import { CATS, inCat, href, type CatSlug } from "./_money";
import { ROLES } from "./_usecases";
import { Icon } from "./_ui";
import CatGrid from "./CatGrid";
import Signup from "./Signup";
export function CategoryPage({ cat }: { cat: CatSlug }) {
  const c = CATS[cat], items = inCat(cat), o = CATS[c.other], url = `https://findbetteralt.com/proto/${cat}`;
  const tasks = [...new Set(items.map((i) => i.task))];
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": url, name: c.h1, description: c.intro, url, audience: c.audience.map((s) => { const r = ROLES.find((x) => x.slug === s)!; return { "@type": r.audience.type, audienceType: r.audience.name }; }), mainEntity: { "@id": `${url}#list` } },
    { "@type": "ItemList", "@id": `${url}#list`, numberOfItems: items.length, itemListElement: items.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.h1, url: `https://findbetteralt.com${href(m)}` })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://findbetteralt.com/proto" }, { "@type": "ListItem", position: 2, name: c.name, item: url }] } ] };
  return <main data-testid="category"><JsonLd data={ld}/>
    <section className="border-b border-rule bg-white"><div className="mx-auto max-w-6xl px-5 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2"><Link href="/proto">Home</Link> › {c.name}</nav>
      <div className="mt-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-tint text-green"><Icon n={c.icon} c="h-6 w-6"/></span><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1></div>
      <p className="mt-3 max-w-3xl text-lg text-ink-2">{c.intro}</p></div></section>
    <div className="mx-auto max-w-6xl space-y-12 px-5 pt-8">
      <CatGrid tasks={tasks} items={items.map((m) => ({ slug: m.slug, h1: m.h1, card: m.card, intent: m.intent, task: m.task, href: href(m) }))}/>
      <Link href={`/proto/${c.other}`} data-testid="other-cat" className="flex items-center justify-between rounded-xl border border-rule bg-surface-low p-5 hover:border-green"><span><span className="text-sm text-ink-2">Also see</span><br/><b className="text-lg">{o.h1}</b><br/><span className="text-ink-2">{inCat(c.other).map((m) => m.h1).join(" · ")}</span></span><span className="text-2xl text-green">→</span></Link>
      <Signup/></div></main>;
}
