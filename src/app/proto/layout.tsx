import type { Metadata } from "next";
import Link from "next/link";
import Nav from "./Nav";
import { ROLES } from "./_usecases";
export const metadata: Metadata = { title: "Prototype: FindBetterAlt use cases", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export default function ProtoLayout({ children }: { children: React.ReactNode }) {
  return <div className="proto bg-paper text-[16px] leading-relaxed">
    {/* Prototype only: hide the live site's header/footer and main padding so the new design shows on its own. */}
    <style>{`body:has(.proto)>header,body:has(.proto)>footer{display:none}body:has(.proto)>main{max-width:none;padding:0}body:has(.proto){background:#f8f9ff}.proto{--color-paper:#f8f9ff;--color-ink:#0b1c30;--color-ink-2:#464555;--color-rule:#e2e8f0;--color-green:#4f46e5;--color-green-dark:#3525cd;--color-green-tint:#eef2ff;--color-hl:#e0e7ff;--color-amber:#92400e;--color-amber-tint:#fef3c7;--color-surface-low:#eff4ff;--font-serif:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.proto *{border-color:#e2e8f0}.proto .bg-surface-low{background:#eff4ff}.proto header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.9);backdrop-filter:blur(8px)}`}</style>
    <div className="bg-ink px-4 py-1.5 text-center text-xs text-white">Prototype for review. Not the live site. Nothing you type is saved or sent.</div>
    <header className="border-b border-rule"><Nav/></header>
    {children}
    <footer className="mt-16 border-t border-rule bg-white"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-ink-2 sm:grid-cols-3">
      <div><b className="text-ink">Get things done</b><br/><Link href="/proto/use-cases">All use cases</Link>{ROLES.filter((r) => r.inMenu).map((r) => <span key={r.slug}><br/><Link href={`/proto/roles/${r.slug}`}>{r.plural}</Link></span>)}</div>
      <div><b className="text-ink">Free tools</b><br/><Link href="/proto/classroom">Classroom</Link><br/><Link href="/proto/running-a-business">Running a business</Link><br/><Link href="/proto/classroom/random-group-generator">Random group generator</Link><br/><Link href="/proto/running-a-business/sop-template">SOP template</Link></div>
      <div><b className="text-ink">How we check</b><br/>Prices come from each company&apos;s own pricing page, with the date we checked. No company pays for our picks.</div>
    </div></footer>
  </div>;
}
