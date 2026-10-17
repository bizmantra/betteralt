import type { Verdict, RedditSummary } from "@/lib/content-schema";
import { fmtDate } from "@/lib/data";
const words = (s: string) => s.trim().split(/\s+/).length;
// Direct answer: plain text, max 60 words (Ron's sign-off). Longer text is not rendered.
export function DirectAnswer({ text }: { text?: string }) {
  if (!text || words(text) > 60) return null;
  return <p className="mt-3 max-w-3xl text-[16px]">{text}</p>;
}
export function VerdictBox({ v }: { v?: Verdict }) {
  if (!v?.headline && !v?.body) return null;
  return <div className="mt-3 max-w-3xl">{v.headline && <p className="font-semibold"><span className="bg-[linear-gradient(transparent_58%,var(--color-hl)_58%)]">{v.headline}</span></p>}{v.body && <p className="mt-1">{v.body}</p>}</div>;
}
// Verbatim quote only from quotes[] with a link; hidden otherwise.
export function RedditQuote({ r }: { r?: RedditSummary }) {
  const q = r?.quotes?.find((x) => x.text && x.url);
  if (!q) return null;
  return <blockquote className="mt-3 max-w-3xl text-sm"><b>On Reddit:</b> “{q.text}” <cite className="not-italic"><a href={q.url} className="underline" target="_blank" rel="nofollow noopener">{q.subreddit ? `r/${q.subreddit}` : "Reddit thread"}{q.capturedAt ? `, ${fmtDate(q.capturedAt)}` : ""} ↗</a></cite>{r?.summary && (r.threads?.filter((t) => t.url).length ?? 0) >= 2 && <> · <a href="#reddit" className="underline">Our read of the threads ↓</a></>}</blockquote>;
}
// Paraphrase renders only with ≥2 linked threads, labelled, no quote marks; threads listed below.
export function RedditThreads({ r }: { r?: RedditSummary }) {
  const threads = (r?.threads ?? []).filter((t) => t.url);
  if (!r?.summary || threads.length < 2) return null;
  return <section id="reddit" className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">What Reddit recommends</h2>
    <p className="mt-1 text-[13px] font-semibold uppercase tracking-wide text-ink-2">Our read of {threads.length} linked threads{r.lastChecked ? ` · read ${fmtDate(r.lastChecked)}` : ""}</p>
    <p className="mt-2 max-w-3xl">{r.summary.replace(/["“”]/g, "")}</p>
    <ul className="mt-2 list-disc pl-5 text-sm">{threads.map((t) => <li key={t.url}><a href={t.url} className="underline" target="_blank" rel="nofollow noopener">{t.title ?? t.url}</a>{t.subreddit ? ` · r/${t.subreddit}` : ""}{t.postedAt ? ` · ${fmtDate(t.postedAt)}` : ""}</li>)}</ul>
  </section>;
}
export function HowToChoose({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return <section className="border-t-2 border-ink pt-3"><h2 className="font-serif text-2xl font-semibold">How to choose</h2><ul className="mt-2 list-disc space-y-1 pl-5">{items.map((x) => <li key={x}>{x}</li>)}</ul></section>;
}
