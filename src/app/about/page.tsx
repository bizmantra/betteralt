import type { Metadata } from "next";
export const metadata: Metadata = { title: "About BetterAlt", description: "How BetterAlt collects and checks AI tool prices and alternatives.", alternates: { canonical: "/about" } };
export default function Page() {
  return <div className="prose max-w-3xl space-y-4"><h1 className="text-3xl font-bold">About BetterAlt</h1>
    <p>BetterAlt helps you find a better or cheaper alternative to any AI tool, with today&apos;s prices.</p>
    <h2 className="text-xl font-semibold">How we check prices</h2>
    <ul className="list-disc pl-5"><li>Every price comes from the vendor&apos;s official pricing page, linked as the source, with the date we last checked it.</li>
      <li>If we couldn&apos;t verify a price (for example the page blocks automated checks), we show &quot;See pricing&quot; with a link instead of guessing.</li>
      <li>Prices are shown in the currency the vendor publishes. INR is shown where the vendor publishes INR; we don&apos;t invent conversions.</li>
      <li>Open-source details (stars, licence, last commit) come from the GitHub API.</li>
      <li>We only publish a page when it has at least three real data points.</li></ul>
    <h2 className="text-xl font-semibold">Money</h2><p>BetterAlt may earn from clearly labelled sponsorships and affiliate links in the future. None are live today.</p></div>;
}
