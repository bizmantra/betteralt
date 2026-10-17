import { fmtDate } from "@/lib/data";
// Dates-only row under the H1 (Neville addendum, Roshan's decision 18 Oct 2026): no names on pages.
// "Updated {date} · Prices checked {range} · How we check prices". reviewedBy/reviewedAt stay in the data, unrendered.
export default function Byline({ updated, checked }: { reviewedBy?: string; authors?: string[]; updated?: string; checked?: string[] }) {
  const ds = (checked ?? []).filter(Boolean).sort();
  const range = ds.length ? (ds[0] === ds.at(-1) ? fmtDate(ds[0]) : `${fmtDate(ds[0]).replace(/ \d{4}$/, ds[0].slice(0, 4) === ds.at(-1)!.slice(0, 4) ? "" : "$&")}–${fmtDate(ds.at(-1)!)}`) : null;
  const parts = [updated && <span key="u">Updated {fmtDate(updated)}</span>, range && <span key="r">Prices checked {range}</span>, <a key="h" href="/about#how-we-check" className="text-ink underline">How we check prices</a>].filter(Boolean);
  return <p className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-[13px] text-ink-2">{parts.map((x, i) => <span key={i}>{i > 0 && <span aria-hidden="true">· </span>}{x}</span>)}</p>;
}
