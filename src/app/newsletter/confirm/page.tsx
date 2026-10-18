import type { Metadata } from "next";
import { BRAND } from "@/lib/data";
import NewsletterAction from "@/components/NewsletterAction";
export const metadata: Metadata = { title: "Confirm your subscription", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() {
  return <div className="max-w-xl space-y-4" data-page-type="newsletter-confirm">
    <h1 className="font-serif text-3xl font-semibold">Confirm your subscription</h1>
    <p className="text-ink-2">{BRAND} newsletter. Click the button to start getting the weekly AI price changes email. You aren&apos;t subscribed until you do.</p>
    <NewsletterAction kind="confirm" />
  </div>;
}
