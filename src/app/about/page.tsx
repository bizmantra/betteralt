import { buildMetadata, Crumbs } from "@/components/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({ title: "About BetterAlt", description: "How BetterAlt collects and checks AI tool prices and alternatives.", path: "/about" });
export default function Page() {
  return <div className="prose max-w-3xl space-y-4"><Crumbs items={[{ name: "About" }]} /><h1 className="text-3xl font-bold">About BetterAlt</h1>
    <p>BetterAlt helps people everywhere find a better or cheaper alternative to any AI tool, with today&apos;s prices in US dollars (plus India pricing where vendors publish it).</p>
    <h2 className="text-xl font-semibold">How we check prices</h2>
    <ul className="list-disc pl-5"><li>Every price comes from the vendor&apos;s official pricing page, linked as the source, with the date we last checked it.</li>
      <li>If we couldn&apos;t verify a price (for example the page blocks automated checks), we show &quot;See pricing&quot; with a link instead of guessing.</li>
      <li>Prices are shown in US dollars, taken from the vendor&apos;s own US pricing. We never convert currencies. Where a vendor also publishes an India (INR) price, it appears as a secondary &quot;India price&quot; line with its own source and date. If we could only find a non-USD price, it&apos;s clearly labelled as such.</li>
      <li>Open-source details (stars, licence, last commit) come from the GitHub API.</li>
      <li>We only publish a page when it has at least three real data points.</li></ul>
    <h2 className="text-xl font-semibold">How BetterAlt makes money</h2>
    <p><strong>Affiliate disclosure:</strong> some links on BetterAlt may be affiliate links. If you sign up or buy through one, we may earn a commission at no extra cost to you. Sponsored or featured placements are always labelled. Neither affects the prices we show, which always come from the vendor&apos;s own pricing page.</p>
    <h2 className="text-xl font-semibold">Contact</h2><p>Corrections, submissions and sponsorship: <a className="text-indigo-600 underline" href="mailto:hello@findbetteralt.com">hello@findbetteralt.com</a>. See also our <a className="underline" href="/privacy">privacy policy</a> and <a className="underline" href="/terms">terms</a>.</p></div>;
}
