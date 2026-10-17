import { BRAND_LEAD, BRAND_HL } from "@/lib/data";
import { ImageResponse } from "next/og";
import { monogramTint, glyph } from "@/components/Monogram";
export const ogSize = { width: 1200, height: 630 };
const INK = "#1B1A17", INK2 = "#5C574C", PAPER = "#FBF8F1", HL = "#F5D547";
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(" ", n - 1)) + "…" : s);
type Line = { name: string; slug: string; text: string };
// Ledger-style card: wordmark + "Prices checked {date}", large title, up to 3 pick lines with 64px monograms, or a summary line.
export function ogCard({ title, checked, lines = [], line, big, foot }: { title: string; checked?: string; lines?: Line[]; line?: string; big?: string; foot?: string }) {
  const t = clip(title, 72);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "56px 64px", background: PAPER, color: INK, fontFamily: "serif", borderBottom: `14px solid ${INK}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{BRAND_LEAD}<span style={{ background: HL, padding: "0 6px" }}>{BRAND_HL}</span></div>
        {checked && <div style={{ display: "flex", fontFamily: "monospace", fontSize: 24, color: INK2 }}>Prices checked {checked}</div>}
      </div>
      <div style={{ display: "flex", marginTop: 44, fontSize: t.length > 48 ? 56 : t.length > 28 ? 64 : 80, fontWeight: 700, lineHeight: 1.05 }}>{t}</div>
      {big && <div style={{ display: "flex", marginTop: 24, fontFamily: "monospace", fontSize: 56, fontWeight: 700 }}>{clip(big, 34)}</div>}
      {lines.length > 0 ? <div style={{ display: "flex", flexDirection: "column", marginTop: 34, gap: 16 }}>
        {lines.slice(0, 3).map((l) => <div key={l.slug} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 64, height: 64, borderRadius: 12, border: `3px solid ${INK}`, background: monogramTint(l.slug), alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>{glyph(l.name)}</div>
          <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 30 }}>{clip(l.text, 60)}</div></div>)}
      </div> : line ? <div style={{ display: "flex", marginTop: 28, fontFamily: "sans-serif", fontSize: 34, color: INK2 }}>{clip(line, 80)}</div> : null}
      <div style={{ display: "flex", marginTop: "auto", fontFamily: "sans-serif", fontSize: 26, color: INK2 }}>{foot ?? "findbetteralt.com · USD prices from vendor pricing pages, with sources"}</div>
    </div>, ogSize);
}
