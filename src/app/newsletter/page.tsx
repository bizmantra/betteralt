import type { Metadata } from "next";
import db from "@/data/db.json";
import { fmtDate } from "@/lib/data";
import { buildMetadata, Crumbs } from "@/components/seo";
import { Newsletter } from "@/components/ui";
// Archive of sent issues. Issues are added to db.newsletterIssues only after they are actually sent.
type Issue = { slug: string; sentAt: string; subject: string; summary?: string; url?: string };
const issues = (((db as unknown as { newsletterIssues?: Issue[] }).newsletterIssues) ?? []).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
export const metadata: Metadata = buildMetadata({ title: "Newsletter archive", description: "Past issues of the BetterAlt weekly email: AI tool price changes and new alternatives, each with its source.", path: "/newsletter" });
export default function Page() {
  return <div className="max-w-3xl space-y-6" data-page-type="newsletter"><Crumbs items={[{ name: "Newsletter archive" }]} />
    <h1 className="font-serif text-3xl font-semibold">Newsletter archive</h1>
    <p className="text-ink-2">One email a week: AI tool price changes and new alternatives, each with a link to the vendor&apos;s own pricing page. Every change also appears in the <a href="/changes" className="underline">price changes log</a> and its <a href="/changes/rss.xml" className="underline">RSS feed</a>.</p>
    {issues.length === 0 ? <p className="rounded-xl border-[1.5px] border-ink bg-white p-4">No issues have been sent yet. The first one goes out once we have a week of price checks to report. Subscribe below to get it.</p> :
      <ul className="divide-y rounded-xl border-[1.5px] border-ink bg-white">{issues.map((i) => <li key={i.slug} id={i.slug} className="p-3"><p className="text-[13px] text-ink-2">{fmtDate(i.sentAt)}</p><p className="font-semibold">{i.url ? <a className="underline" href={i.url}>{i.subject}</a> : i.subject}</p>{i.summary && <p className="text-sm">{i.summary}</p>}</li>)}</ul>}
    <Newsletter source="newsletter-archive" placement="end" />
  </div>;
}
