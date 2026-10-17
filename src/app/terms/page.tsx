import { buildMetadata, Crumbs } from "@/components/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({ title: "Terms of use", description: "The terms for using BetterAlt, including how we show prices and affiliate links.", path: "/terms" });
const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-6 text-xl font-semibold">{children}</h2>;
export default function Page() {
  return <div className="max-w-3xl space-y-3 text-slate-700"><Crumbs items={[{ name: "Terms" }]} /><h1 className="text-3xl font-bold text-slate-900">Terms of use</h1>
    <p className="text-sm text-slate-500">Last updated 18 Oct 2026</p>
    <p>These terms apply to your use of BetterAlt (findbetteralt.com), a directory of AI tools and their alternatives run from India. By using the site you agree to them.</p>
    <H>Information only</H>
    <p>BetterAlt is a free information resource. We take prices from each vendor&apos;s official pricing page and show the source and the date we last checked. Prices, plans and features change often, can vary by country, currency, tax and billing period, and may include limited-time offers. Always confirm the current price and terms on the vendor&apos;s site before you buy. Where we couldn&apos;t verify a price, we say &quot;See pricing&quot; instead of guessing.</p>
    <p>Descriptions, ratings such as setup difficulty, and &quot;who it&apos;s for&quot; notes are our editorial opinion, not professional, legal or financial advice. We are not responsible for decisions you make based on the site.</p>
    <H>Affiliate links and sponsorships</H>
    <p>Some links may be affiliate links, so we may earn a commission if you buy through them, at no extra cost to you. Sponsored or featured placements are labelled. Payment never changes the prices we report.</p>
    <H>Third-party tools and sites</H>
    <p>We link to tools and websites we don&apos;t own or control. Your use of them is governed by their own terms and privacy policies, and we aren&apos;t responsible for their content, availability or products. Trademarks and product names belong to their owners; listing a tool doesn&apos;t imply endorsement by or affiliation with that vendor.</p>
    <H>Using our content</H>
    <p>You&apos;re welcome to link to any page and quote short excerpts with a link back. Please don&apos;t copy the directory wholesale or scrape it in a way that harms the site.</p>
    <H>Submissions</H>
    <p>If you submit a tool, correction or other content, you confirm it&apos;s accurate to the best of your knowledge and let us edit and publish it. We may decline or remove any listing.</p>
    <H>No warranty and liability</H>
    <p>The site is provided &quot;as is&quot; without warranties of any kind. To the extent the law allows, BetterAlt is not liable for any indirect or consequential loss arising from your use of the site.</p>
    <H>Governing law</H>
    <p>These terms are governed by the laws of India.</p>
    <H>Changes and contact</H>
    <p>We may update these terms and will change the date above when we do. Questions or corrections: <a className="text-indigo-600 underline" href="mailto:hello@findbetteralt.com">hello@findbetteralt.com</a>.</p>
  </div>;
}
