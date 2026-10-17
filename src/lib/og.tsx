import { ImageResponse } from "next/og";
export const ogSize = { width: 1200, height: 630 };
export function ogCard({ title, line, foot }: { title: string; line?: string; foot?: string }) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#eef2ff 0%,#ffffff 60%)", fontFamily: "sans-serif", color: "#0f172a" }}>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>Better<span style={{ color: "#4f46e5" }}>Alt</span></div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 64 : 80, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
        {line && <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#334155" }}>{line}</div>}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#64748b" }}>{foot ?? "findbetteralt.com · prices from vendor pricing pages, with sources"}</div>
    </div>, ogSize);
}
