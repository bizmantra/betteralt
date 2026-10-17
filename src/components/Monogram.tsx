// Generated monogram tile (no third-party logos). Tint: FNV-1a(slug) → hue, high lightness; blue hues are reserved for Sponsored.
export function fnv1a(s: string) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
export function monogramTint(slug: string) {
  let hue = fnv1a(slug) % 360;
  if (hue >= 195 && hue <= 245) hue = (hue + 60) % 360; // keep clear of --blue (sponsored)
  return `hsl(${hue} 55% 89%)`;
}
export const glyph = (name: string) => (name.match(/[A-Za-z0-9]/)?.[0] ?? "?").toUpperCase();
export default function Monogram({ name, slug, size = 40 }: { name: string; slug: string; size?: number }) {
  return <span aria-hidden="true" style={{ width: size, height: size, background: monogramTint(slug), fontSize: Math.round(size * 0.45) }}
    className="inline-grid shrink-0 place-items-center rounded-lg border-[1.5px] border-ink font-serif font-semibold text-ink">{glyph(name)}</span>;
}
