import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/data";
import { JsonLd } from "@/components/ui";

const cut = (s: string, n = 155) => { if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, c.lastIndexOf(" ")).replace(/[\s,.;:(·-]+$/, "") + "…"; };
// Next replaces nested openGraph objects instead of merging, so always pass the full object.
export function buildMetadata({ title, description, path, type = "website", robots, ogImage = "/opengraph-image" }: { title: string; description: string; path: string; type?: "website" | "article"; robots?: Metadata["robots"]; ogImage?: string }): Metadata {
  const d = cut(description);
  return { title, description: d, alternates: { canonical: path }, robots,
    openGraph: { siteName: "BetterAlt", locale: "en_US", type, url: path, title, description: d, images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description: d, images: [ogImage] } };
}

export const orgGraph = { "@context": "https://schema.org", "@graph": [
  { "@type": "Organization", "@id": `${SITE}/#org`, name: "BetterAlt", url: SITE, logo: `${SITE}/logo.png`, email: "hello@findbetteralt.com" },
  { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "BetterAlt", publisher: { "@id": `${SITE}/#org` } },
] };

// Visible breadcrumb + matching BreadcrumbList JSON-LD. Last item is the current page (no href).
export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...(c.href ? { item: SITE + (c.href === "/" ? "" : c.href) } : {}) })) };
  return <nav aria-label="Breadcrumb" className="text-sm text-slate-500"><JsonLd data={ld} />
    {all.map((c, i) => <span key={i}>{i > 0 && " / "}{c.href && i < all.length - 1 ? <Link href={c.href} className="hover:underline">{c.name}</Link> : <span>{c.name}</span>}</span>)}</nav>;
}
