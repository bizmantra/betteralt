import { ogCard, ogSize } from "@/lib/og";
export const size = ogSize; export const contentType = "image/png"; export const alt = "BetterAlt: find a better or cheaper alternative to any AI tool";
export default function Image() { return ogCard({ title: "Find a better or cheaper alternative to any AI tool", line: "USD prices from vendor pricing pages, with sources and checked dates" }); }
