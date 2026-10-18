import type { Metadata } from "next";
import { BRAND } from "@/lib/data";
import NewsletterAction from "@/components/NewsletterAction";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() {
  return <div className="max-w-xl space-y-4" data-page-type="newsletter-unsubscribe">
    <h1 className="font-serif text-3xl font-semibold">Unsubscribe</h1>
    <p className="text-ink-2">{BRAND} newsletter. Click the button to stop getting our emails. You can also delete your address from our list.</p>
    <NewsletterAction kind="unsubscribe" />
  </div>;
}
