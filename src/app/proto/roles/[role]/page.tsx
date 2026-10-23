import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui";
import { ROLES, CT, forRole, role as getRole, type ContentType } from "../../_usecases";
import { UCCard } from "../../UseCaseGrid";
import { tool, fmt, limits } from "../../_data";
import { Sample } from "../../_ui";
export const dynamicParams = false;
export function generateStaticParams() { return ROLES.map((r) => ({ role: r.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; return { title: `AI use cases: ${getRole(role)?.plural ?? ""} (prototype)` }; }
const GROUPS: ContentType[] = ["free-tool", "template", "guide", "comparison", "checklist", "prompts"];
// Extra free-plan facts read from vendor pricing pages on 23 Oct 2026 (see _data.ts), for tools not yet in db.json.
const EXTRA: Record<string, string[]> = { teacher: ["Eduaide", "Diffit"] };
export default async function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params; const r = getRole(role); if (!r) notFound();
  const items = forRole(r.slug), used = new Set<string>();
  const groups = GROUPS.map((c) => ({ c, list: items.filter((u) => { if (used.has(u.slug) || !u.contentTypes.includes(c)) return false; used.add(u.slug); return true; }) })).filter((g) => g.list.length);
  const counts = new Map<string, number>(); items.forEach((u) => u.relatedTools.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, r.full ? 6 : 4).map(([s]) => tool(s));
  const extra = limits.filter((l) => (EXTRA[r.slug] ?? []).includes(l.name));
  return <main className="mx-auto max-w-6xl px-5 py-10">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: `AI use cases for ${r.plural.toLowerCase()}`, audience: { "@type": r.audience.type, audienceType: r.audience.name },
      mainEntity: { "@type": "ItemList", itemListElement: items.map((u, i) => ({ "@type": "ListItem", position: i + 1, name: u.title, ...(u.status === "live" ? { url: `https://findbetteralt.com/proto/use-cases/${u.slug}` } : {}) })) } }}/>
    <p className="text-sm text-ink-2"><Link href="/proto">Home</Link> › <Link href="/proto/use-cases">Use cases</Link> › By role</p>
    <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Use cases for {r.plural.toLowerCase()}</h1>
    <p className="mt-2 text-ink-2">{items.length} use cases{r.full ? "" : " so far"}. Many also suit other roles.</p>
    <div className="mt-8 grid gap-12 lg:grid-cols-[2fr_1fr]"><div className="space-y-10">
      {groups.map((g) => <section key={g.c} aria-labelledby={`g-${g.c}`} data-testid="ct-group"><h2 id={`g-${g.c}`} className="font-serif text-2xl">{CT[g.c].plural}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">{g.list.map((u) => <UCCard key={u.slug} u={u}/>)}</div></section>)}
      {!items.length && <p>Nothing here yet.</p>}
    </div>
    <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
      <section aria-labelledby="tt" data-testid="top-tools"><h2 id="tt" className="font-serif text-2xl">Most-used AI tools</h2>
        <ul className="mt-3 divide-y divide-rule rounded-xl border border-rule bg-white">{top.map((t) => <li key={t.slug} className="p-4">
          <b>{t.name}</b>
          <p className="text-sm">{t.pricing.verified ? (/^free/i.test(t.pricing.summary ?? "") ? "" : t.pricing.hasFreePlan ? "Has a free plan. " : "No free plan. ") + (t.pricing.summary ?? "") : <Sample/>}</p>
          <p className="text-xs text-ink-2">Checked <span className="font-mono">{fmt(t.pricing.lastChecked)}</span> · <a className="underline" href={t.pricing.sourceUrl} target="_blank" rel="noopener nofollow">source</a></p></li>)}
          {extra.map((l) => <li key={l.name} className="p-4"><b>{l.name}</b><p className="text-sm">Free: {l.free}. Paid: {l.paid}</p>
            <p className="text-xs text-ink-2">Checked <span className="font-mono">{l.checked}</span> · <a className="underline" href={l.source} target="_blank" rel="noopener nofollow">source</a></p></li>)}</ul></section>
      <section aria-labelledby="rr"><h2 id="rr" className="font-serif text-2xl">Related roles</h2>
        <ul className="mt-2 flex flex-wrap gap-2">{r.related.map((s) => <li key={s}><Link href={`/proto/roles/${s}`} className="rounded-full border border-rule bg-white px-3 py-1 text-sm">{getRole(s)!.plural}</Link></li>)}</ul></section>
    </aside></div>
  </main>;
}
