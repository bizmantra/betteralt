import type { Tool } from "./data";
// Real destinations only (no /go/ cloaking). Affiliate/sponsored → rel sponsored; direct vendor → nofollow. No noreferrer.
export const hrefFor = (t: Tool) => t.affiliateUrl ?? t.url;
export const linkType = (t: Tool, sponsored = false) => (sponsored ? "sponsored" : t.affiliateUrl ? "affiliate" : "direct");
export const relFor = (t: Tool, sponsored = false) => (sponsored || t.affiliateUrl ? "sponsored nofollow noopener" : "nofollow noopener");
