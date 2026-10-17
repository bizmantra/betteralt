import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import AltCard from "@/components/slots/AltCard";
import type { Tool } from "@/lib/data";
import { fmtDate, site } from "@/lib/data";

const TAG: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-800", freemium: "bg-sky-100 text-sky-800", paid: "bg-slate-100 text-slate-700",
  "open source": "bg-violet-100 text-violet-800", "self-hostable": "bg-amber-100 text-amber-800",
};
export function Tags({ tags }: { tags: string[] }) {
  return <div className="flex flex-wrap gap-1.5">{tags.map((t) => <span key={t} className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG[t] ?? "bg-slate-100"}`}>{t}</span>)}</div>;
}
const BUILD = new Date();
export const isStale = (iso: string, days = site.staleAfterDays ?? 14) => (BUILD.getTime() - new Date(iso + "T00:00:00Z").getTime()) / 86400000 > days;
/** Shown exactly when the gate demoted a price for age (newest snapshot older than 14 days), so badge and ranking agree. */
export function RecheckBadge({ t }: { t: Tool }) {
  if (t.pricing.unverifiedReason !== "stale") return null;
  return <p className="text-[13px]"><span className="rounded bg-amber-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber">Re-checking price</span> <span className="text-ink-2">Last checked {fmtDate(t.pricing.lastChecked)}. Prices older than {site.staleAfterDays ?? 14} days show as not yet verified.</span></p>;
}
export function SourceLink({ t, href, region, label }: { t: Tool; href: string; region: "us" | "in"; label?: string }) {
  return <a className="underline" href={href} target="_blank" rel="nofollow noopener" data-track="source_click" data-tool={t.slug} data-region={region}>{label ?? "source"}<span className="sr-only"> ({t.name} {region === "in" ? "India " : ""}pricing source, opens in a new tab)</span></a>;
}
const BASIS = { monthly: "billed monthly", annual: "billed annually", unknown: "" } as const;
/** Starting price in one short line, from verified data only. */
export function startLine(t: Tool) {
  const p = t.pricing;
  if (p.currency === "USD" && p.fromUsdMonthly != null && p.fromUsdMonthly > 0) return `From $${p.fromUsdMonthly}/mo${p.fromBilling && BASIS[p.fromBilling] ? ` ${BASIS[p.fromBilling]}` : ""}${p.hasFreePlan ? " · free plan" : ""}`;
  const first = (p.summary ?? "").split(";")[0].trim();
  if (p.hasFreePlan && !/[$€£₹]\s?\d/.test(p.summary ?? "")) return first || "Free";
  const paid = (p.summary ?? "").split(";").map((x) => x.trim()).find((x) => /[$€£₹]\s?\d/.test(x));
  return `${paid ?? first}${p.hasFreePlan && paid ? " · free plan" : ""}`;
}
export function Price({ t, compact, card }: { t: Tool; compact?: boolean; card?: boolean }) {
  const p = t.pricing;
  if (!p.verified || !p.summary) return <div className="space-y-1 text-sm">
    <RecheckBadge t={t} />
    {p.unverifiedReason !== "stale" && <p><span className="rounded bg-amber-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber">Price not yet verified</span></p>}
    <p><a href={p.sourceUrl} target="_blank" rel="nofollow noopener" data-track="source_click" data-tool={t.slug} data-region="us" className="font-medium text-green underline">See {t.name} pricing ↗</a></p></div>;
  const local = p.currency && p.currency !== "USD";
  const label = p.currency === "INR" ? "India price (INR)" : p.currency === "EUR" ? "Price in EUR" : p.currency;
  const full = <>
    <p className="text-[14px] font-semibold text-ink">{p.summary}</p>
    {p.fromBilling === "annual" && p.fromUsdMonthly != null && <p>Starting price ${p.fromUsdMonthly}/mo is billed annually</p>}
    {p.india && <p>India: {p.india.summary.replace(/\s*\(India pricing[^)]*\)/, "")} · checked {fmtDate(p.india.lastChecked)}{!compact && <> · <SourceLink t={t} href={p.india.sourceUrl} region="in" /></>}</p>}
  </>;
  const checked = <p>Checked {fmtDate(p.lastChecked)} · <SourceLink t={t} href={p.sourceUrl} region="us" />{p.extraSources?.map((u, i) => <span key={u}> · <SourceLink t={t} href={u} region="us" label={`source ${i + 2}`} /></span>)}</p>;
  if (card) return <div className="space-y-0.5 font-mono text-[13px] leading-relaxed text-ink-2">
    {local && <p className="font-sans text-[12px] font-semibold uppercase tracking-wide text-amber">{label} · USD price not available</p>}
    <p className="text-[14px] font-semibold text-ink">{startLine(t)}</p>
    {checked}
    <details className="pt-1"><summary className="cursor-pointer font-sans text-[13px] underline" data-track="plans_toggle" data-track-open-only="" data-tool={t.slug}>All plans</summary><div className="mt-1 space-y-0.5">{full}</div></details>
  </div>;
  return <div className="space-y-0.5 font-mono text-[13px] leading-relaxed text-ink-2">
    {local && <p className="font-sans text-[12px] font-semibold uppercase tracking-wide text-amber">{label} · USD price not available</p>}
    {full}
    {!compact && checked}
  </div>;
}
export function Grid({ items }: { items: Tool[] }) {
  return <ol className="flex flex-col gap-4">{items.map((t, i) => <li key={t.slug}><AltCard t={t} position={i + 1} /></li>)}</ol>;
}
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
export function Newsletter({ source, placement = "end" }: { source?: string; placement?: string }) {
  return <div className="rounded-xl border-[1.5px] border-ink bg-white p-6">
    <h2 className="text-xl font-semibold">Get the weekly AI price changes email</h2>
    <p className="mt-1 text-sm text-slate-600">One email a week: AI tool price changes and new alternatives, with sources. Free, no spam, unsubscribe any time. See our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
    <NewsletterForm source={source} placement={placement} />
  </div>;
}
export const itemList = (name: string, items: Tool[]) => ({
  "@context": "https://schema.org", "@type": "ItemList", name,
  itemListElement: items.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `https://findbetteralt.com/tools/${t.slug}` })),
});
