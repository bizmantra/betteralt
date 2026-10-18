// Organization logo for structured data (seo.tsx → /logo.png). Rendered from the brand setting in site.json, so it
// always matches the header wordmark (lead + highlighted "Alt"). Replaces the old single-letter "B" monogram.
import { ImageResponse } from "next/og";
import { BRAND_LEAD, BRAND_HL } from "@/lib/data";
export const dynamic = "force-static";
const INK = "#1B1A17", PAPER = "#FBF8F1", HL = "#F5D547";
export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: PAPER, color: INK, fontFamily: "serif", borderBottom: `24px solid ${INK}` }}>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>{BRAND_LEAD}<span style={{ background: HL, padding: "0 8px" }}>{BRAND_HL}</span></div>
    </div>, { width: 600, height: 600 });
}
