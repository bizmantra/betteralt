import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import type { Tool } from "@/lib/data";
import { fmtStars, fmtDate } from "@/lib/data";

const TAG: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-800", freemium: "bg-sky-100 text-sky-800", paid: "bg-slate-100 text-slate-700",
  "open source": "bg-violet-100 text-violet-800", "self-hostable": "bg-amber-100 text-amber-800",
};
export function Tags({ tags }: { tags: string[] }) {
  return <div className="flex flex-wrap gap-1.5">{tags.map((t) => <span key={t} className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG[t] ?? "bg-slate-100"}`}>{t}</span>)}</div>;
}
export function Price({ t, compact }: { t: Tool; compact?: boolean }) {
  const p = t.pricing;
  if (!p.summary) return <p className="text-sm"><a href={p.sourceUrl} target="_blank" rel="nofollow noopener" className="font-medium text-indigo-600 underline">See pricing ↗</a> <span className="text-xs text-slate-500">(not yet verified · tried {fmtDate(p.lastChecked)})</span></p>;
  const local = p.currency && p.currency !== "USD";
  const label = p.currency === "INR" ? "India price (INR)" : p.currency === "EUR" ? "Price in EUR" : p.currency;
  return <div className="text-sm">
    {local && <p className="text-xs font-medium uppercase tracking-wide text-amber-700">{label} · USD price not available</p>}
    <p className="font-medium text-slate-800">{p.summary}</p>
    {!compact && <p className="mt-0.5 text-xs text-slate-500">Last checked {fmtDate(p.lastChecked)} · <a className="underline" href={p.sourceUrl} target="_blank" rel="nofollow noopener">source</a></p>}
    {p.india && <p className="mt-1 text-xs text-slate-600"><span className="font-medium">India price:</span> {p.india.summary}{!compact && <> · {fmtDate(p.india.lastChecked)} · <a className="underline" href={p.india.sourceUrl} target="_blank" rel="nofollow noopener">source</a></>}</p>}
  </div>;
}
export function ToolCard({ t }: { t: Tool }) {
  const o = t.openSource;
  return <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><h3 className="text-lg font-semibold"><Link href={`/tools/${t.slug}`} className="hover:text-indigo-600">{t.name}</Link></h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">{t.category}</p></div>
      <a href={t.url} target="_blank" rel="nofollow noopener" className="shrink-0 rounded-lg border px-3 py-1 text-sm hover:bg-slate-50">Visit ↗</a>
    </div>
    <p className="text-sm text-slate-700">{t.description}</p>
    <Tags tags={t.tags} />
    <Price t={t} />
    <p className="text-sm text-slate-600"><span className="font-medium">Who it&apos;s for:</span> {t.whoFor}</p>
    {o && <p className="text-xs text-slate-600">⭐ {fmtStars(o.stars)} GitHub stars · {o.license}{o.setupDifficulty ? ` · setup difficulty ${o.setupDifficulty}/5` : ""}{o.archived ? " · ⚠️ repo archived" : ""} · <a href={o.repo} className="underline" target="_blank" rel="nofollow noopener">repo</a></p>}
  </div>;
}
export function Grid({ items }: { items: Tool[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((t) => <ToolCard key={t.slug} t={t} />)}</div>;
}
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
export function Newsletter({ source }: { source?: string }) {
  return <div className="rounded-2xl bg-indigo-50 p-6">
    <h2 className="text-xl font-semibold">Get the weekly AI price changes email</h2>
    <p className="mt-1 text-sm text-slate-600">One email a week: AI tool price changes and new alternatives, with sources. Free, no spam, unsubscribe any time. See our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
    <NewsletterForm source={source} />
  </div>;
}
export const itemList = (name: string, items: Tool[]) => ({
  "@context": "https://schema.org", "@type": "ItemList", name,
  itemListElement: items.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `https://findbetteralt.com/tools/${t.slug}` })),
});
