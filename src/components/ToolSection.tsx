import type { Tool } from "@/lib/data";
import { site } from "@/lib/data";
import { groupAlts } from "@/lib/picks";
import AltCard from "@/components/slots/AltCard";
// Ranked cards for verified tools only (groupAlts); unverified tools listed unranked underneath.
export default function ToolSection({ id, title, intro, items, anchor, start = 1 }: { id: string; title: string; intro?: string; items: Tool[]; anchor: string; start?: number }) {
  const { ranked, unverified } = groupAlts(items);
  return <section aria-labelledby={`${id}-h`} className="space-y-3">
    <h2 id={`${id}-h`} className="border-t-2 border-ink pt-3 font-serif text-2xl font-semibold">{title}</h2>
    {intro && <p className="max-w-3xl text-ink-2">{intro}</p>}
    <ol className="flex flex-col gap-4">{ranked.map((t, i) => <li key={t.slug}><AltCard t={t} anchor={anchor} position={start + i} /></li>)}</ol>
    {unverified.length > 0 && <><p className="text-sm text-ink-2">Price not yet verified on the vendor&apos;s own page in the last {site.staleAfterDays ?? 14} days, so not ranked:</p>
      <ul className="flex flex-col gap-4">{unverified.map((t) => <li key={t.slug}><AltCard t={t} anchor={anchor} position={0} /></li>)}</ul></>}
  </section>;
}
