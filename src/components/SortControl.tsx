"use client";
import { useId, useState } from "react";
import { track } from "@/lib/track";
// The only client control on listing pages. Cards stay server-rendered in curated order; this sets CSS `order`.
type Mode = "pick_order" | "starting_price";
export default function SortControl({ listId, count }: { listId: string; count: number }) {
  const [mode, setMode] = useState<Mode>("pick_order"); const name = useId();
  function apply(m: Mode) {
    setMode(m); track("sort_change", { sort: m });
    const list = document.getElementById(listId); if (!list) return;
    const cards = [...list.querySelectorAll<HTMLElement>(":scope > [data-sort-rank]")];
    const inline = [...list.querySelectorAll<HTMLElement>(":scope > [data-inline-after]")];
    if (m === "pick_order") { [...cards, ...inline].forEach((el) => (el.style.order = "")); return; }
    cards.sort((x, y) => Number(x.dataset.sortRank) - Number(y.dataset.sortRank)).forEach((el, i) => (el.style.order = String(i * 2)));
    inline.forEach((el) => (el.style.order = String(Number(el.dataset.inlineAfter) * 2 - 1)));
  }
  const opts: [Mode, string][] = [["pick_order", "Our pick order"], ["starting_price", "Lowest starting price"]];
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
    <div role="radiogroup" aria-label="Sort alternatives" className="hidden gap-2 sm:flex">
      {opts.map(([v, l]) => <label key={v} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-[1.5px] border-ink px-3 ${mode === v ? "bg-ink text-white" : "bg-white"}`}>
        <input type="radio" name={name} value={v} checked={mode === v} onChange={() => apply(v)} className="sr-only" />{l}</label>)}
    </div>
    <label className="sm:hidden"><span className="sr-only">Sort alternatives</span>
      <select value={mode} onChange={(e) => apply(e.target.value as Mode)} className="min-h-11 rounded-md border-[1.5px] border-ink bg-white px-2">{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <a href="#how-we-picked" className="underline">How we order</a>
    <p aria-live="polite" className="text-ink-2">{count} alternatives</p>
  </div>;
}
