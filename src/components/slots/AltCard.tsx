import Link from "next/link";
import type { Tool, AnchorAlternative } from "@/lib/data";
import { fmtStars, site } from "@/lib/data";
import { Price } from "@/components/ui";
import Monogram from "@/components/Monogram";
import Cta from "./Cta";

function Badges({ t }: { t: Tool }) {
  const b: { k: string; cls: string }[] = [];
  if (t.status && t.status !== "active") b.push({ k: t.status === "renamed" && t.formerNames?.length ? `Renamed (was ${t.formerNames.join(", ")})` : (site.statusLabels?.[t.status] ?? t.status), cls: "bg-rust-tint text-rust" });
  const ok = t.pricing.verified === true; // unverified tools get no badges (Draco)
  if (ok && t.pricing.hasFreePlan) b.push({ k: "Free plan", cls: "text-ink-2" });
  if (ok && t.tags.includes("open source") && t.openSource?.licenseType === "open-source") b.push({ k: `Open source · ${t.openSource.license}`, cls: "bg-green-tint text-green" });
  if (ok && t.openSource && t.openSource.licenseType !== "open-source") b.push({ k: t.openSource.licenseType === "fair-code" ? "Fair-code (source-available)" : "Source-available", cls: "bg-amber-tint text-amber" });
  if (ok && t.tags.includes("self-hostable")) b.push({ k: "Self-hostable", cls: "text-ink-2" });
  if (!b.length) return null;
  return <p className="flex flex-wrap gap-1.5">{b.map((x) => <span key={x.k} className={`rounded px-1.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-wide ${x.cls}`}>{x.k}</span>)}</p>;
}
// Anatomy (Hermione/Neville): tile+name+category → Best for → Why → Skip if → badges → price → CTA → pros/cons.
export default function AltCard({ t, meta, anchor, anchorName, position, extra }: { t: Tool; meta?: AnchorAlternative; anchor?: string; anchorName?: string; position: number; extra?: { replaces?: string; cantDo?: string } }) {
  const o = t.openSource, n = t.notes;
  const bestFor = meta?.bestFor ?? t.whoFor, why = meta?.why ?? t.description;
  const pros = (n?.pros ?? []).filter((x) => x.text), cons = (n?.cons ?? []).filter((x) => x.text);
  return <article id={`alt-${t.slug}`} className="grid gap-3 rounded-xl border-[1.5px] border-ink bg-white p-4 lg:grid-cols-[40px_minmax(0,1.5fr)_minmax(0,1fr)_200px] lg:gap-4">
    <Monogram name={t.name} slug={t.slug} />
    <div className="space-y-1.5">
      <h3 className="font-serif text-xl font-semibold"><Link href={`/tools/${t.slug}`} className="hover:underline">{t.name}</Link></h3>
      <p className="text-[13px] uppercase tracking-wide text-ink-2">{t.category}</p>
      {bestFor && <p className="text-[15px]"><b className="bg-[linear-gradient(transparent_58%,var(--color-hl)_58%)] font-semibold">Best for:</b> {bestFor}</p>}
      {why && <p className="text-[15px]">{meta?.why && anchorName ? `Why it's an alternative to ${anchorName}: ` : ""}{why}</p>}
      {extra?.replaces && <p className="text-[15px]"><b className="font-semibold">Replaces:</b> {extra.replaces}</p>}
      {extra?.cantDo && <p className="text-[15px]"><b className="font-semibold">Can&apos;t do:</b> {extra.cantDo}</p>}
      {n?.notFor?.[0] && <p className="text-[15px] text-rust"><b className="font-semibold">Skip if:</b> {n.notFor[0]}</p>}
      <Badges t={t} />
    </div>
    <div className="space-y-1 border-t border-dashed pt-2 lg:border-t-0 lg:pt-0">
      <Price t={t} card />
      {o && <p className="font-mono text-[13px] text-ink-2">★ {fmtStars(o.stars)} · {o.license}{o.setupDifficulty ? ` · Setup ${o.setupDifficulty}/5` : ""}{o.archived ? " · archived" : ""} · <a href={o.repo} className="underline" target="_blank" rel="nofollow noopener">repo<span className="sr-only"> ({t.name} GitHub repository)</span></a></p>}
    </div>
    <div className="lg:self-start">
      <Cta t={t} anchor={anchor} placement="card" position={position} />
      {(pros.length > 0 || cons.length > 0) && <details className="mt-2 border-t pt-2 text-sm"><summary className="cursor-pointer font-semibold" data-track="details_toggle" data-track-open-only="" data-tool={t.slug}>Pros and cons</summary>
        {pros.length > 0 && <ul className="mt-1 list-disc pl-5">{pros.map((p) => <li key={p.text}>{p.sourceUrl ? <a href={p.sourceUrl} className="underline" rel="nofollow noopener">{p.text}</a> : p.text}</li>)}</ul>}
        {cons.length > 0 && <ul className="mt-1 list-disc pl-5 text-rust">{cons.map((p) => <li key={p.text}>{p.sourceUrl ? <a href={p.sourceUrl} className="underline" rel="nofollow noopener">{p.text}</a> : p.text}</li>)}</ul>}
      </details>}
    </div>
  </article>;
}
