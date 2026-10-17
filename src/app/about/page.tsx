import { BRAND, SITE, site, people } from "@/lib/data";
import { buildMetadata, Crumbs } from "@/components/seo";
import { JsonLd } from "@/components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({ title: `About ${BRAND}`, description: `Who runs ${BRAND} and how we check AI tool prices and alternatives.`, path: "/about" });
// One-line contributions describe what each person does for the site (no employer, no photos).
const CONTRIB: Record<string, string> = {
  "rosh-k": "Reviews what we publish across the site.",
  "kavi-r": "Helps review our education and tutoring pages.",
};
export default function Page() {
  const team = people.filter((p) => p.name && p.role && CONTRIB[p.slug ?? ""]);
  const ld = { "@context": "https://schema.org", "@type": "AboutPage", "@id": `${SITE}/about#webpage`, url: `${SITE}/about`, name: `About ${BRAND}`, publisher: { "@id": `${SITE}/#org` },
    mainEntity: team.map((p) => ({ "@type": "Person", name: p.name, jobTitle: p.role, worksFor: { "@id": `${SITE}/#org` } })) };
  return <div className="max-w-3xl space-y-6" data-page-type="about"><JsonLd data={ld} /><Crumbs items={[{ name: "About" }]} />
    <h1 className="font-serif text-3xl font-semibold">About {BRAND}</h1>
    <p>{BRAND} helps you find a better or cheaper alternative to the AI tools you already use, and shows what each one really costs, with the vendor&apos;s own page as the source.</p>
    <section aria-labelledby="team-h"><h2 id="team-h" className="font-serif text-xl font-semibold">Who we are</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{team.map((p) => <li key={p.slug} className="rounded-xl border-[1.5px] border-ink bg-white p-4">
        <p className="font-serif text-lg font-semibold">{p.name}</p><p className="text-[13px] uppercase tracking-wide text-ink-2">{p.role}</p><p className="mt-2 text-[15px]">{CONTRIB[p.slug ?? ""]}</p></li>)}</ul>
      <p className="mt-2 text-sm text-ink-2">{site.disclosures?.aiAssisted}</p></section>
    <section id="how-we-check" className="scroll-mt-4 space-y-2"><h2 className="font-serif text-xl font-semibold">How we check prices</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Every price comes from the vendor&apos;s official pricing page, linked as the source, with the date we last checked it.</li>
        <li>Each check saves a plain-text snapshot of that page, taken by a script (no AI in that step). When the site is built, an automated gate confirms that every price and plan name we show appears in the snapshot. If one doesn&apos;t, the site doesn&apos;t publish until it&apos;s fixed.</li>
        <li>We re-check {(site.recheckSchedule ?? "regularly").replace(/^T/, "t")}. Unverified tools are listed separately and are never ranked or given a badge.</li>
        <li>Prices are in US dollars from the vendor&apos;s own page and are never converted. When a vendor only shows us a local price (for example in INR), that price is shown in its own currency and labelled.</li>
        <li>We say whether a starting price is billed monthly or annually, and we only compare prices on the same basis.</li>
        <li>&quot;Open source&quot; means an OSI-approved licence, checked against the repository&apos;s licence file. Fair-code and source-available licences are labelled as such.</li>
        <li>/changes lists vendor price changes only when two of our snapshots (before and after) show them. Fixes to our own data are listed separately as corrections.</li>
      </ul></section>
    <section className="space-y-2"><h2 className="font-serif text-xl font-semibold">How {BRAND} makes money</h2>
      <p><strong>Affiliate disclosure:</strong> some links on {BRAND} may be affiliate links. If you sign up or buy through one, we may earn a commission at no extra cost to you. Sponsored placements are always labelled. Neither changes our order, badges or prices.</p></section>
    <section className="space-y-2"><h2 className="font-serif text-xl font-semibold">Contact</h2><p>Corrections, submissions and sponsorship: <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>. See also our <a className="underline" href="/privacy">privacy policy</a> and <a className="underline" href="/terms">terms</a>.</p></section>
  </div>;
}
