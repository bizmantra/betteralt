import Link from "next/link";
import type { Tool } from "@/lib/data";
import { getPerson, site, FILTERS, type FilterKey } from "@/lib/data";
import type { Pick } from "@/lib/picks";
import { Price } from "@/components/ui";
import Monogram from "@/components/Monogram";
import NewsletterForm from "@/components/NewsletterForm";
import Cta from "./Cta";

export function BestForList({ items, anchor }: { items: Pick[]; anchor: string }) {
  if (items.length < 2) return null;
  return <ul className={`mt-4 grid gap-2 sm:grid-cols-2 ${items.length === 3 ? "xl:grid-cols-3" : ""}`} aria-label="Best for">
    {items.map((p) => <li key={p.kind} className="flex flex-col gap-2 rounded-lg border-[1.5px] border-ink bg-white p-3">
      <div className="flex items-start gap-2"><Monogram name={p.tool.name} slug={p.tool.slug} size={28} />
        <div className="min-w-0"><p className="text-[12px] font-semibold uppercase tracking-wide text-ink-2">{p.label}</p>
          <p className="font-semibold"><a href={`#alt-${p.tool.slug}`} className="underline">{p.tool.name}</a></p>
          {p.tool.pricing.summary && <p className="font-mono text-[13px] text-ink-2">{p.tool.pricing.summary}</p>}
          <p className="text-[13px] text-ink-2">{p.criterion}</p></div></div>
      <Cta t={p.tool} anchor={anchor} placement="best_for" />
    </li>)}
  </ul>;
}
export function ReplacingBox({ t }: { t: Tool }) {
  return <aside className="rounded-xl border-[1.5px] border-ink bg-white p-4 lg:self-start">
    <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-2">You&apos;re replacing</p>
    <div className="mt-2 flex items-center gap-2"><Monogram name={t.name} slug={t.slug} size={36} /><div><Link href={`/tools/${t.slug}`} className="font-semibold underline">{t.name}</Link><p className="text-[13px] text-ink-2">{t.category}</p></div></div>
    <p className="mt-2 text-sm">{t.description}</p><div className="mt-2"><Price t={t} /></div>
  </aside>;
}
export function FilterLinks({ tool, n, active, keys }: { tool: string; n: number; active?: FilterKey; keys: FilterKey[] }) {
  if (!keys.length) return null; // chips only for built, indexable variant pages
  const cls = (on: boolean) => `inline-flex min-h-11 items-center whitespace-nowrap rounded-full border-[1.5px] border-ink px-3 text-sm ${on ? "bg-ink text-white" : "bg-white"}`;
  return <nav aria-label="Filter alternatives" className="flex gap-2 overflow-x-auto py-1">
    <a href={`/alternatives/${tool}`} className={cls(!active)} {...(!active ? { "aria-current": "page" as const } : {})} data-track="filter_click" data-anchor={tool} data-filter="all">All {n}</a>
    {keys.map((f) => <a key={f} href={`/alternatives/${tool}/${f}`} className={cls(active === f)} {...(active === f ? { "aria-current": "page" as const } : {})} data-track="filter_click" data-anchor={tool} data-filter={f}>{FILTERS[f].label}</a>)}
  </nav>;
}
export function NewsletterInline({ tool, source }: { tool: string; source: string }) {
  return <div className="grid gap-3 rounded-xl border-[1.5px] border-ink bg-green-tint p-5 md:grid-cols-2 md:items-center">
    <div><p className="font-serif text-xl font-semibold">Get {tool}-alternative price changes, weekly</p>
      <p className="text-sm">One email a week when AI tool prices change, with the source for every change. Free, unsubscribe any time. <Link href="/privacy" className="underline">Privacy</Link>.</p></div>
    <NewsletterForm source={source} placement="inline" />
  </div>;
}
export function MethodologyCard({ reviewedBy }: { reviewedBy?: string }) {
  const p = getPerson(reviewedBy);
  return <section id="how-we-picked" className="scroll-mt-4 border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">How we picked</h2>
    <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5 text-[15px]">
      <li>Prices come from each vendor&apos;s official pricing page, in US dollars, never converted. Every price shows the date we checked it and links to its source. We re-check {site.recheckSchedule ?? "regularly"}; a price older than {site.staleAfterDays ?? 30} days is marked &quot;Re-checking price&quot;.</li>
      <li>Order: &quot;Our pick order&quot; is our hand-curated list of the closest alternatives. It isn&apos;t a numbered ranking. &quot;Lowest starting price&quot; sorts by the cheapest paid plan we list; some starting prices are billed annually and are labelled that way.</li>
      <li>&quot;Best for&quot; picks either come from our editors with a stated reason, or from a rule shown next to the pick (for example, lowest listed starting price).</li>
      <li>Money: {site.disclosure?.affiliate} Affiliate links are labelled next to the button. {site.disclosures?.sponsored}</li>
      <li>Reddit: we only show quotes copied word for word, each linked to its thread. Any summary is labelled as our read and lists the threads it&apos;s based on.</li>
      <li>{site.disclosures?.aiAssisted}</li>
      <li>Spotted a mistake? Email <a href={`mailto:${site.email}`} className="underline">{site.email}</a> and we&apos;ll fix it.</li>
    </ul>
    {p && <div className="mt-3 inline-block rounded-lg border-[1.5px] border-ink bg-white p-3 text-sm"><p className="text-[12px] font-semibold uppercase tracking-wide text-ink-2">Reviewer</p><p className="font-semibold">{p.name}, {p.role}</p>{p.credential && <p>{p.credential}</p>}{p.bio && <p className="text-ink-2">{p.bio}</p>}</div>}
  </section>;
}
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">FAQ</h2>
    {items.map((f, i) => <details key={f.q} className="mt-2 rounded-lg border bg-white p-3"><summary className="cursor-pointer font-semibold" data-track="faq_toggle" data-track-open-only="" data-index={i + 1}>{f.q}</summary><p className="mt-1 text-[15px]">{f.a}</p></details>)}
  </section>;
}
