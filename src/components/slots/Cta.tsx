import type { Tool } from "@/lib/data";
import { hrefFor, relFor, linkType } from "@/lib/links";
export default function Cta({ t, anchor, placement, position, full = true, secondary }: { t: Tool; anchor?: string; placement: string; position?: number; full?: boolean; secondary?: boolean }) {
  const shut = t.status === "shut-down" || secondary;
  return <div className={full ? "w-full" : ""}>
    <a href={hrefFor(t)} target="_blank" rel={relFor(t)} data-track="outbound_click" data-tool={t.slug} data-anchor={anchor ?? "none"} data-placement={placement}
      {...(position ? { "data-position": position } : {})} data-link-type={linkType(t)}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-[15px] font-semibold ${full ? "w-full" : ""} ${shut ? "border-[1.5px] border-ink bg-white text-ink hover:bg-paper" : "bg-green text-white hover:bg-green-dark"}`}>
      {shut ? "Visit site ↗" : `Visit ${t.name} ↗`}<span className="sr-only"> (opens in a new tab)</span></a>
    {t.affiliateUrl && <p className="mt-1 text-[13px] text-ink-2">Affiliate link · <a href="#how-we-picked" className="underline">what this means</a></p>}
  </div>;
}
