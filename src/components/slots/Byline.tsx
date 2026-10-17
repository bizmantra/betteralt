import { getPerson, fmtDate } from "@/lib/data";
import type { Person } from "@/lib/data";
const display = (p: Person) => `${p.firstNameOnly ? (p.name ?? "").split(" ")[0] : p.name}, ${p.role}`;
// "Reviewed by {name}, {role} · … · Updated {date} · Prices checked {range} · How we check prices". 0–4 people; no photos.
export default function Byline({ reviewedBy, authors, updated, checked }: { reviewedBy?: string; authors?: string[]; updated?: string; checked?: string[] }) {
  const ppl = [...new Set([reviewedBy, ...(authors ?? [])].filter(Boolean) as string[])].map(getPerson).filter((p): p is Person => !!p?.name && !!p.role).slice(0, 4);
  const ds = (checked ?? []).filter(Boolean).sort();
  const range = ds.length ? (ds[0] === ds.at(-1) ? fmtDate(ds[0]) : `${fmtDate(ds[0]).replace(/ \d{4}$/, ds[0].slice(0, 4) === ds.at(-1)!.slice(0, 4) ? "" : "$&")}–${fmtDate(ds.at(-1)!)}`) : null;
  return <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-2">
    {ppl.length > 0 && <span>Reviewed by {ppl.map((p, i) => <span key={p.slug}>{i > 0 && " · "}<span className="text-ink">{display(p)}</span></span>)}</span>}
    {updated && <span>Updated {fmtDate(updated)}</span>}
    {range && <span>Prices checked {range}</span>}
    <a href="#how-we-picked" className="text-ink underline">How we check prices</a>
  </p>;
}
