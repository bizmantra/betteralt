// Retired-brand and "no Dell" text checks, shared by the publishing gate (src, public, data, email templates) and the
// post-build scan of the built output. Pure functions so scripts/test-text-checks.ts can test them.
import fs from "node:fs"; import path from "node:path";

// Lookalike letters (Cyrillic, Greek, others) folded to the Latin letter they imitate. NFKC handles full-width and
// mathematical letters; this covers the cross-script ones NFKC leaves alone.
const CONFUSABLE: Record<string, string> = {
  "а": "a", "в": "b", "е": "e", "ё": "e", "һ": "h", "і": "i", "ї": "i", "ј": "j", "к": "k", "ӏ": "l", "м": "m", "н": "h", "о": "o", "р": "p", "с": "c", "ѕ": "s", "т": "t", "у": "y", "х": "x", "ԁ": "d", "ԛ": "q", "ԝ": "w", "ь": "b",
  "А": "a", "В": "b", "Е": "e", "Ѐ": "e", "Ё": "e", "Н": "h", "І": "i", "Ј": "j", "К": "k", "М": "m", "О": "o", "Р": "p", "С": "c", "Ѕ": "s", "Т": "t", "Х": "x", "Ү": "y", "Ӏ": "l",
  "α": "a", "β": "b", "ε": "e", "ι": "i", "κ": "k", "ν": "v", "ο": "o", "ρ": "p", "τ": "t", "υ": "u", "χ": "x", "ℓ": "l", "ı": "i", "ǀ": "l", "ⅼ": "l", "ꓲ": "l", "ꓡ": "l", "ꓓ": "d", "ꓰ": "e", "ꓐ": "b", "ꓮ": "a", "ꓔ": "t",
  "Α": "a", "Β": "b", "Ε": "e", "Ζ": "z", "Η": "h", "Ι": "i", "Κ": "k", "Μ": "m", "Ν": "n", "Ο": "o", "Ρ": "p", "Τ": "t", "Υ": "y", "Χ": "x",
};
const CONF_RE = new RegExp(`[${Object.keys(CONFUSABLE).join("")}]`, "g");
// Zero-width, joiners, bidi controls, soft hyphen, variation selectors, BOM, word joiner, invisible separators
const INVISIBLE = /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180f\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u206f\ufe00-\ufe0f\ufeff]/g;
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "", zwsp: "", zwj: "", zwnj: "" };

/** Fold text for matching: decode HTML entities and \uXXXX escapes, NFKC, drop invisible characters, fold lookalike
 *  letters, strip HTML/JSX tags (so Better<span>Alt</span> reads as BetterAlt), lowercase. */
export function foldText(s: string, stripTags = true) {
  return s
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d{1,7});?/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)
    .replace(/\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(parseInt(a ?? b ?? c, 16)))
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .replace(CONF_RE, (c) => CONFUSABLE[c])
    .replace(/<\/?[a-z][^<>]{0,400}>/gi, (m) => (stripTags ? "" : m))   // tags, with attributes
    .toLowerCase();
}

/** Retired brand: BetterAlt / Better Alt / Better-Alt / betteralts (old domain), any case, lookalikes, split by tags.
 *  The current brand FindBetterAlt and the domain findbetteralt.com are allowed. */
// Each check runs twice: with tags stripped (catches Better<span>Alt</span>) and with tags kept (catches attribute
// values such as href="https://betteralt.com" or alt="Dell").
const both = (s: string, re: RegExp, allow?: RegExp) => [true, false].flatMap((strip) => {
  const t = allow ? foldText(s, strip).replace(allow, " ") : foldText(s, strip);
  return [...t.matchAll(re)].map((m) => m[0]);
});
export function brandHits(s: string): string[] {
  return both(s, /(?<![a-z])better[\s\-_.]*alts?(?![a-z])/g, /find[\s\-_.]*better[\s\-_.]*alt/g);
}
/** "Dell" as a word, any case, with lookalikes and invisible characters removed. */
export function dellHits(s: string): string[] {
  return both(s, /(?<![a-z])dell(?![a-z])/g);
}

export type TextHit = { file: string; rule: "retired-brand" | "no-dell"; match: string };
const TEXT_EXT = /\.(tsx?|jsx?|mjs|cjs|json|md|mdx|txt|xml|css|html?|svg|rsc|body|meta|webmanifest|ya?ml|csv)$/i;
/** Build-machine paths (e.g. /workspace/betteralt/node_modules/... in client manifests) aren't site text. */
export const BUILD_PATH_SEGMENT = /(?<=[/\\])betteralt(?:-[a-z0-9]+)?(?=[/\\])/gi;
/** Walk roots and return every hit. skipDirs/skipFiles by basename; binary files are skipped by extension. */
export function scanText(roots: string[], base: string, opts: { skipDirs?: string[]; skipFiles?: RegExp; dell?: boolean; brand?: boolean; ignore?: RegExp[] } = {}): TextHit[] {
  const skipDirs = new Set(opts.skipDirs ?? []), out: TextHit[] = [];
  const walk = (p: string): string[] => {
    if (!fs.existsSync(p)) return [];
    const st = fs.statSync(p); if (st.isFile()) return [p];
    return fs.readdirSync(p, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (skipDirs.has(e.name) ? [] : walk(path.join(p, e.name))) : [path.join(p, e.name)]));
  };
  for (const f of roots.flatMap(walk)) {
    if (!TEXT_EXT.test(f) || (opts.skipFiles && opts.skipFiles.test(f))) continue;
    const txt = (opts.ignore ?? []).reduce((t, re) => t.replace(re, " "), fs.readFileSync(f, "utf8")), rel = path.relative(base, f);
    if (opts.brand !== false) for (const m of new Set(brandHits(txt))) out.push({ file: rel, rule: "retired-brand", match: m });
    if (opts.dell !== false) for (const m of new Set(dellHits(txt))) out.push({ file: rel, rule: "no-dell", match: m });
  }
  return out;
}
