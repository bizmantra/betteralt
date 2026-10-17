import { buildMetadata, Crumbs } from "@/components/seo";
import type { Metadata } from "next";
export const metadata: Metadata = buildMetadata({ title: "Privacy policy", description: "How BetterAlt handles analytics, cookies, newsletter emails and your data.", path: "/privacy" });
const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-6 text-xl font-semibold">{children}</h2>;
export default function Page() {
  return <div className="max-w-3xl space-y-3 text-slate-700"><Crumbs items={[{ name: "Privacy" }]} /><h1 className="text-3xl font-bold text-slate-900">Privacy policy</h1>
    <p className="text-sm text-slate-500">Last updated 18 Oct 2026 (newsletter signup source added)</p>
    <p>BetterAlt (findbetteralt.com) is a directory of AI tools and their alternatives, run from India. This page explains, in plain language, what data we collect and why. We try to collect as little as possible.</p>
    <H>What we collect</H>
    <ul className="list-disc space-y-1 pl-5">
      <li><strong>Analytics.</strong> We may use privacy-respecting analytics (for example Google Analytics or Vercel Analytics) to count page views and see which pages are useful. These tools may set cookies or similar identifiers and record things like your browser, device type, approximate location (country/city from IP address), referring site and pages visited. We do not use this to identify you personally.</li>
      <li><strong>Newsletter.</strong> If you subscribe, we store your email address and the date you signed up so we can send you our newsletter (AI price changes and new alternatives). Every email has an unsubscribe link, and you can ask us to delete your address at any time. We use <a className="underline" href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">Resend</a> (Resend, Inc., USA) to store subscriber addresses and send these emails, so your address is processed on their servers. We also record which page you signed up from and, if present, the campaign tags in the link you arrived from (utm_source, utm_medium, utm_campaign) and the name of the referring website (not the full address), so we know which places send us readers.</li>
      <li><strong>Messages you send us.</strong> If you email us or submit a tool or sponsorship request, we keep that message and your contact details to reply and handle the request.</li>
      <li><strong>Server logs.</strong> Our hosting provider (Vercel) keeps standard technical logs such as IP address and request time for security and reliability.</li>
    </ul>
    <H>Cookies</H>
    <p>BetterAlt itself does not need cookies to work. Analytics tools and affiliate partners may set cookies. Affiliate cookies let a vendor know you came from BetterAlt if you later sign up. You can block or delete cookies in your browser settings; the site will still work.</p>
    <H>Affiliate links</H>
    <p>Some outbound links may be affiliate links. When you click one, the vendor (or its affiliate network) may record that the visit came from BetterAlt and may pay us a commission if you buy. What happens on the vendor&apos;s site is covered by their own privacy policy.</p>
    <H>What we don&apos;t do</H>
    <ul className="list-disc space-y-1 pl-5"><li>We don&apos;t sell your personal data.</li><li>We don&apos;t ask for payment details. Any payment for sponsorship is handled by a payment provider such as Stripe.</li><li>We don&apos;t knowingly collect data from children under 18.</li></ul>
    <H>Sharing</H>
    <p>We share data only with the service providers that help us run the site (Vercel for hosting, analytics providers, Resend for email, and a payment provider such as Stripe), or when the law requires it. These providers may process data outside India.</p>
    <H>Your choices and rights</H>
    <p>You can unsubscribe from emails at any time and ask us to access, correct or delete the personal data we hold about you, including under India&apos;s Digital Personal Data Protection Act, 2023 where it applies. Email <a className="text-indigo-600 underline" href="mailto:hello@findbetteralt.com">hello@findbetteralt.com</a> and we&apos;ll respond within a reasonable time.</p>
    <H>Retention</H>
    <p>We keep newsletter addresses until you unsubscribe or ask us to delete them, and messages for as long as needed to handle your request.</p>
    <H>Changes</H>
    <p>If we change this policy, we&apos;ll update the date at the top of this page.</p>
    <H>Contact</H>
    <p>Questions about privacy: <a className="text-indigo-600 underline" href="mailto:hello@findbetteralt.com">hello@findbetteralt.com</a>.</p>
  </div>;
}
