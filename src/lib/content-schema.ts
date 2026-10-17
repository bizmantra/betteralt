/**
 * FindBetterAlt content schema additions (draft v1, 18 Oct 2026 IST, Hermione / content strategy)
 *
 * Purpose: one agreed set of field names and types for the editorial content we plan to add,
 * so that (a) Harry can add them to src/lib/data.ts + src/data/db.json, (b) Neville's template
 * components take props with exactly these names, and (c) content ships as data only, never TSX edits.
 *
 * Conventions copied from the existing model (src/lib/data.ts @ bb30613):
 *   - camelCase keys; `slug` is the id; references to tools are tool slugs (string)
 *   - dates are ISO "YYYY-MM-DD" strings (rendered with fmtDate); every price/claim carries `sourceUrl`
 *   - `lastChecked` = date we looked; `lastChangedAt` / `contentUpdatedAt` = date something changed
 *   - USD is primary; INR only where the vendor publishes it; never converted
 * Aligned with Ron's SEO spec §3 (seo-spec-for-harry.md): `plans`, `notes.{summary,pros,cons,notFor,
 * reviewedBy,reviewedAt}`, anchor `summary/howToChoose/filterIntros/faq`, anchor alternatives `{slug, why, bestFor}`,
 * `priceHistory` shape. Where this file differs from Ron's draft it says so in a NOTE.
 *
 * Every new field is OPTIONAL. Templates must render a slot only when its field is present.
 * "Used by" names the page type(s) whose template reads the field.
 * Rule from Roshan: no employer is ever named. There is deliberately no employer/company field on people.
 */

// ---------------------------------------------------------------------------
// Existing model (mirror of src/lib/data.ts so this file type-checks standalone)
// ---------------------------------------------------------------------------
type ISODate = string; // "YYYY-MM-DD"
type Slug = string;
type FilterKey = "free" | "open-source" | "self-hosted" | "cheaper";

type ExistingIndiaPrice = { summary: string; sourceUrl: string; lastChecked: ISODate };
type ExistingPricing = {
  summary: string | null; fromUsdMonthly: number | null; hasFreePlan: boolean | null; verified: boolean;
  sourceUrl: string; lastChecked: ISODate; lastChangedAt?: ISODate; currency?: string | null; india?: ExistingIndiaPrice;
};
type ExistingTool = {
  slug: Slug; name: string; url: string; category: string; description: string; whoFor: string; tags: string[];
  pricing: ExistingPricing;
  status?: "active" | "renamed" | "acquired" | "shut-down"; formerNames?: string[]; statusNote?: string; statusSources?: string[];
  firstPublished?: ISODate; contentUpdatedAt?: ISODate;
  openSource: {
    repo: string; stars: number;
    /** SPDX id/expression for OSI licences (e.g. "MIT", "AGPL-3.0 core"), or the licence's own name otherwise. */
    license: string;
    /** Licence taxonomy (gate-enforced): "open-source" = OSI-approved licence only; otherwise source-available or fair-code.
     *  Only "open-source" tools may carry the "open source" tag, appear on /open-source or win "Best open source". */
    licenseType: "open-source" | "source-available" | "fair-code";
    /** One line on what the licence covers, e.g. "MIT core; packages/ee under a commercial licence". */
    licenseNote?: string;
    archived: boolean; lastPush: string; setupDifficulty: number | null;
  } | null;
};
type ExistingAnchor = { slug: Slug; alternatives: Slug[]; firstPublished?: ISODate; contentUpdatedAt?: ISODate };
type ExistingSaas = { slug: Slug; name: string; toolSlug: Slug; alternatives: Slug[]; redirectTo?: string; firstPublished?: ISODate; contentUpdatedAt?: ISODate };
type ExistingStack = { slug: Slug; title: string; intro: string; items: { tool: Slug; role: string }[]; firstPublished?: ISODate; contentUpdatedAt?: ISODate };
type ExistingChange = { date: ISODate; slug: Slug; kind: string; old: string; new: string; sourceUrl: string;
  /** vendor_change = the vendor moved the price (both snapshots required); correction = we fixed our own wrong data.
   *  Corrections are labelled as such and never presented as vendor price moves. Gate-enforced. */
  type: "vendor_change" | "correction";
  /** Snapshot paths (data/snapshots/...). vendor_change needs before + after; correction needs after (before may be null when no snapshot exists). */
  evidence: { before: string | null; after: string; note?: string };
};

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** A sentence or bullet that may carry its own source. Used by: all editorial blocks. */
export type SourcedText = {
  /** Plain text, no HTML/markdown. */
  text?: string;
  /** Vendor doc, changelog, or thread backing the claim. Required by the validator for factual claims. */
  sourceUrl?: string;
};

/** Q&A pair. Used by: alternatives, filter variant, ai-alternative-to, tool, comparison, stack. */
export type FaqItem = {
  /** Question exactly as shown (also the FAQPage `name`). */
  q?: string;
  /** Approved, page-specific answer. FAQPage JSON-LD is emitted only for data FAQs, never for generated ones (Ron §5). */
  a?: string;
};

/**
 * Editorial provenance shared by every editorial record. Drives the byline strip and WebPage/Article JSON-LD.
 * Used by: tool (notes), alternatives, filter variant, ai-alternative-to, comparison, stack, category.
 */
export type Editorial = {
  /** Person slugs (see `Person`) who wrote it. Empty/absent = `Researched by the FindBetterAlt research agent` (Ron §6). */
  authors?: Slug[];
  /** Person slug who reviewed/approved it (e.g. "roshan-kumar"). Maps to schema `reviewedBy`. */
  reviewedBy?: Slug;
  /** Date of that review. */
  reviewedAt?: ISODate;
};

/** One Reddit (or forum) thread we summarised. Used by: RedditSummary. */
export type RedditThread = {
  /** Full permalink, e.g. https://www.reddit.com/r/ChatGPTCoding/comments/... */
  url?: string;
  /** Thread title as posted. */
  title?: string;
  /** Subreddit without "r/", e.g. "ChatGPTCoding". */
  subreddit?: string;
  /** Date the thread was posted. */
  postedAt?: ISODate;
};

/**
 * "What Reddit recommends" block: our paraphrase of real threads, never invented quotes or vote counts.
 * Used by: alternatives (anchor), tool (notes), comparison.
 */
export type RedditSummary = {
  /**
   * 40-120 word paraphrase of the consensus, in our voice. Approved by Roshan (18 Oct 2026). Must render with the label
   * "Our read of {threads.length} linked threads" and the thread list; hidden unless threads has 2 or more entries.
   * No quote marks here: direct quotes live only in quotes[].
   */
  summary?: string;
  /** Tool slugs mentioned most often, in order. Lets the template link/highlight cards. */
  mostRecommended?: Slug[];
  /** Recurring complaints or caveats from the threads. */
  commonComplaints?: string[];
  /** Threads the summary is based on (min 2 enforced by the validator). Rendered as linked sources. */
  threads?: RedditThread[];
  /** Date we last read the threads. */
  lastChecked?: ISODate;
  /**
   * Verbatim quotes, copied exactly (no edits, no stitching), each linked to its comment or thread. The one-line
   * Reddit teaser on cards and at the top of the page renders ONLY from here; if this is empty the teaser is hidden.
   */
  quotes?: RedditQuote[];
};

/** One verbatim Reddit quote. Used by: Reddit teaser line, RedditSummary block. */
export type RedditQuote = {
  /** Exact text as posted, 30 words max, trimmed only at sentence boundaries. */
  text: string;
  /** Permalink to the comment (preferred) or the thread. */
  url: string;
  /** Subreddit without "r/". */
  subreddit?: string;
  /** Date we copied it. */
  capturedAt?: ISODate;
  /** Date we last confirmed the quote verbatim on the live comment. The quote only renders when this is set (Hermione, 18 Oct). */
  liveCheckedAt?: ISODate;
};

/**
 * Short opinionated verdict box. Used by: tool (notes.verdict), alternatives (anchor.verdict), comparison (structured),
 * ai-alternative-to.
 */
export type Verdict = {
  /** One-line headline, e.g. "Switch if you mainly code in the terminal". */
  headline?: string;
  /** 40-80 word verdict body. */
  body?: string;
  /** Tool slug we'd pick overall (listing pages). Ignored on tool pages. */
  bestOverall?: Slug;
  /** Tool slug of the cheapest verified paid option we'd actually recommend. */
  bestBudget?: Slug;
  /** Tool slug of the best free option. */
  bestFree?: Slug;
  /** Tool slug of the best open-source option. */
  bestOpenSource?: Slug;
  /** One-line reason (20 words max) per pick, shown next to it. A pick with no reason is not rendered. */
  pickReasons?: Partial<Record<"overall" | "budget" | "free" | "openSource", string>>;
};

// ---------------------------------------------------------------------------
// People (authors / reviewers / contributors)
// ---------------------------------------------------------------------------

/**
 * A contributor. New root collection `db.people`. Used by: byline strip on every editorial page, stack author box,
 * future /authors/[slug] page, Person JSON-LD.
 * Privacy rules: family contributors appear by FIRST NAME ONLY and only where they genuinely contributed; names come
 * from Roshan; no photo for minors. There is intentionally NO employer/company field.
 */
export type Person = {
  /** URL id, e.g. "roshan-kumar" or a first name in lowercase. */
  slug?: Slug;
  /** Display name. Full name for Roshan; first name only for family contributors. */
  name?: string;
  /**
   * Full byline descriptor rendered as "{name}, {role}", e.g. "product manager, AI enthusiast" (Rosh K) or
   * "educator" (Kavi R). There is intentionally no separate byline field. Never an employer name.
   */
  role?: string;
  /** 1-2 sentences on why they know this topic (first-hand experience). Approved by Roshan. */
  bio?: string;
  /** Short credential line shown in the author box, e.g. "Tutors high-school chemistry". */
  credential?: string;
  /** Path under /public to a photo. Leave absent for minors. */
  photo?: string;
  /** Profiles that really exist (X, LinkedIn...). Maps to Person.sameAs. */
  sameAs?: string[];
  /** If true, render first name only even if `name` has more (safety net for family members). */
  firstNameOnly?: boolean;
};

// ---------------------------------------------------------------------------
// Pricing: plans, India price, price history
// ---------------------------------------------------------------------------

/** One vendor plan (Ron §3 `Plan`, all fields optional here for incremental fill). Used by: tool, pricing (future), comparison, stack. */
export type Plan = {
  /** Vendor's plan name, e.g. "Pro". */
  name?: string;
  /** Monthly USD price billed monthly. null = not offered monthly. */
  usdMonthly?: number | null;
  /** Per-month USD price when billed annually. */
  usdAnnualMonthly?: number | null;
  /** Monthly INR price exactly as the vendor publishes it (never converted). */
  inrMonthly?: number | null;
  /** Billing model. */
  billing?: "monthly" | "annual" | "usage" | "one-time" | "free";
  /** Key limits in one line, e.g. "500 fast requests/mo". */
  limits?: string;
  /** Vendor pricing page for this plan. */
  sourceUrl?: string;
  /** Per-seat price (team plans) so comparison/stack templates can compute 1/3/10-seat cost. */
  perSeat?: boolean;
};

/**
 * India price, extends the existing `pricing.india` (keeps summary/sourceUrl/lastChecked names).
 * Used by: tool, alternatives table ₹ column, comparison, stack total (INR), future /pricing/[tool]#india.
 */
export type IndiaPrice = ExistingIndiaPrice & {
  /** Cheapest paid INR monthly figure as published, for sorting and stack totals. */
  fromInrMonthly?: number | null;
  /** Whether the published INR price includes 18% GST, as stated by the vendor. null = vendor doesn't say. */
  includesGst?: boolean | null;
  /** Whether the vendor charges in INR at checkout (vs only displaying it). */
  billedInInr?: boolean;
  /** Date the INR price last changed (lastChecked is when we looked). */
  lastChangedAt?: ISODate;
};

/**
 * One price change. Extends the existing root `changes[]` record (keeps date/slug/kind/old/new/sourceUrl).
 * NOTE vs Ron §3: Ron puts `priceHistory[]` on each tool. Recommend ONE store (root `changes`) and derive
 * `priceHistory` per tool with a selector (`changesFor(slug)`) so /changes, tool, pricing and comparison pages never
 * disagree. Used by: /changes, tool, alternatives "What changed recently", comparison, newsletter, RSS.
 */
export type PriceChange = ExistingChange & {
  /** Stable id used as /changes#id anchor and RSS guid, e.g. "2026-10-18-shopify-magic". */
  id?: string;
  /** Which price list changed. */
  region?: "US" | "IN";
  /** Currency of old/new strings. */
  currency?: "USD" | "INR" | "EUR";
  /** Plan affected, matching Plan.name. */
  plan?: string;
  /** Percent change of the headline figure; computed by script, not hand-typed. */
  pctChange?: number;
  /** Optional one-line "what this means for you" note (content-strategy writes, Roshan approves). */
  note?: string;
  /** Person slug who approved publication of the note. */
  approvedBy?: Slug;
};

// ---------------------------------------------------------------------------
// Tool detail additions
// ---------------------------------------------------------------------------

/**
 * Editorial notes on a tool (Ron §3 `notes`, extended with verdict + redditSummary).
 * Used by: tool detail; pros/cons/notFor also on ToolCard in listings.
 */
export type ToolNotes = Editorial & {
  /** 1-2 sentence definition + fit, used in the tool summary box (Ron §6.1). */
  summary?: string;
  /** Verdict box on the tool page. */
  verdict?: Verdict;
  /** What it does well (3-5 bullets, sourced where factual). */
  pros?: SourcedText[];
  /** Where it falls short (3-5 bullets). */
  cons?: SourcedText[];
  /** Who should NOT use it. NOTE: Ron types this as a single string; we use string[] so cards can show the first item. */
  notFor?: string[];
  /** Reddit consensus about this tool. */
  redditSummary?: RedditSummary;
};

/** Affiliate / sponsorship fields (business plan L87-90). Used by: ToolCard CTA, tool page CTA, /sponsor. */
export type Monetisation = {
  /** Affiliate link; when set the CTA uses it with rel="sponsored nofollow noopener". Never changes ranking. */
  affiliateUrl?: string;
  /** Paid featured placement; template must show a "Sponsored" label while active. */
  featured?: {
    /** Placement starts showing on this date (inclusive). */
    from?: ISODate;
    until?: ISODate;
    anchors?: Slug[];
    label?: string;
    /** Person slug who approved the deal (Roshan). Required by the validator; unapproved placements don't render. */
    approvedBy?: Slug;
    approvedAt?: ISODate;
  };
};

export type ToolAdditions = {
  /** Structured plans (USD primary, INR where published). Used by: tool plan table, comparison, stack cost. */
  plans?: Plan[];
  /** India price block, replaces the type of pricing.india (same keys plus extras). */
  pricing?: ExistingPricing & {
    india?: IndiaPrice;
    /** Billing basis of fromUsdMonthly until per-plan data exists. Savings deltas only compare the same basis. */
    fromBilling?: "monthly" | "annual" | "unknown";
    /** Set at build by the gate (never hand-typed): why a price is shown as "not yet verified". */
    unverifiedReason?: "stale" | "dead-link" | "never-verified";
  };
  /** Editorial notes (see ToolNotes). */
  notes?: ToolNotes;
  /** Optional short hands-on note by Roshan. Rendered as "Tested by {name}, {date}" only when present. */
  testedNote?: { text: string; testedBy: Slug; testedAt: ISODate };
  /** Successor tool slug for renamed/acquired/shut-down tools (Ron §3). Used by: status banner, ToolCard badge. */
  successor?: Slug;
  /** Approved FAQ for the tool page. */
  faq?: FaqItem[];
  /** Category slug (see Category); keeps the existing free-text `category` as the display name until migrated. */
  categorySlug?: Slug;
  /** Platforms, e.g. ["Web", "macOS", "VS Code"]. Used by: comparison at-a-glance, SoftwareApplication.operatingSystem. */
  platforms?: string[];
} & Monetisation;
export type Tool = Omit<ExistingTool, "pricing"> & { pricing: NonNullable<ToolAdditions["pricing"]> } & Omit<ToolAdditions, "pricing">;

// ---------------------------------------------------------------------------
// Alternatives listing (+ filter variants)
// ---------------------------------------------------------------------------

/** Per-anchor info about one alternative (Ron §3). Used by: alternatives ToolCard "why" + "best for" lines, comparison table. */
export type AnchorAlternative = {
  /** Tool slug. */
  slug?: Slug;
  /** Why it's an alternative to THIS anchor specifically (1 sentence). */
  why?: string;
  /** Short "Best for ..." label, e.g. "terminal-first developers". */
  bestFor?: string;
};

/** Used by: /alternatives/[tool] and /alternatives/[tool]/[filter]. */
export type Anchor = Omit<ExistingAnchor, "alternatives"> & Editorial & {
  /** Hand-ordered list. Plain slugs still accepted during migration; templates normalise to AnchorAlternative. */
  alternatives: (Slug | AnchorAlternative)[];
  /** 40-80 word direct answer at the top of the page (Ron §6.2 block 2). */
  summary?: string;
  /** Verdict box (best overall / budget / free / open source). */
  verdict?: Verdict;
  /** "Why people switch from {Tool}" bullets, sourced. */
  whySwitch?: SourcedText[];
  /** 3-5 decision rules (Ron §6.2 block 8). */
  howToChoose?: string[];
  /** 40-80 word intro per filter variant; a variant is indexable only when its intro exists (lib/seo.ts L32). */
  filterIntros?: Partial<Record<FilterKey, string>>;
  /** "What Reddit recommends" block. */
  redditSummary?: RedditSummary;
  /** Approved FAQ; replaces the generated FAQ in alternatives/[tool]/page.tsx L25-29 when present. */
  faq?: FaqItem[];
  /** Comparison slugs to link in the "Compare" block (must exist in `comparisons`). */
  comparisons?: Slug[];
};

// ---------------------------------------------------------------------------
// AI alternative to classic SaaS
// ---------------------------------------------------------------------------

/** Used by: /ai-alternative-to/[saas]. */
export type Saas = ExistingSaas & Editorial & {
  /** "AI-native replacements for {SaaS} and what you lose" summary (Ron §6.6). */
  summary?: string;
  /** Per-alternative: what it replaces and what it can't do. Keyed by tool slug. */
  replaces?: Record<Slug, { replaces?: string; cantDo?: string }>;
  /** "Keep {SaaS} + AI add-on vs switch" paragraph. */
  keepVsSwitch?: string;
  /** Verdict box. */
  verdict?: Verdict;
  /** Approved FAQ. */
  faq?: FaqItem[];
};

// ---------------------------------------------------------------------------
// Comparison (a-vs-b) pages  ->  new root collection `db.comparisons`
// ---------------------------------------------------------------------------

/** Used by: /compare/[a]-vs-[b] (new template), plus "Compare" link blocks on tool and alternatives pages. */
export type Comparison = Editorial & {
  /** "{a}-vs-{b}" with slugs in alphabetical order (Ron §2); the reverse order 308s. */
  slug?: Slug;
  /** First tool slug (alphabetically first). */
  a?: Slug;
  /** Second tool slug. */
  b?: Slug;
  /** Verdict box (Ron §6.4 block 2), 50-80 words total. */
  verdict?: {
    /** "Pick {A} if ..." */
    pickA?: string;
    /** "Pick {B} if ..." */
    pickB?: string;
    /** "If cost matters most: ..." */
    ifCostMatters?: string;
  };
  /** Plan pairs matched by tier for the side-by-side table, by Plan.name. */
  planPairs?: { tier?: string; aPlan?: string; bPlan?: string }[];
  /** Seat counts to cost out where both have per-seat plans (default [1, 3, 10]). Costs are computed, not typed. */
  seatCounts?: number[];
  /** 3-6 key differences, each sourced. */
  keyDifferences?: SourcedText[];
  /** Who should pick A (bullets). */
  whoShouldPickA?: string[];
  /** Who should pick B (bullets). */
  whoShouldPickB?: string[];
  /** Reddit view on this matchup. */
  redditSummary?: RedditSummary;
  /** 3 tool slugs for "Alternatives to both". */
  alternativesToBoth?: Slug[];
  /** Approved FAQ. */
  faq?: FaqItem[];
  firstPublished?: ISODate;
  contentUpdatedAt?: ISODate;
};

// ---------------------------------------------------------------------------
// Stacks
// ---------------------------------------------------------------------------

/** Used by: /stacks/[stack] stack table rows. */
export type StackItem = ExistingStack["items"][number] & {
  /** Plan we actually use, matching the tool's Plan.name. Cost is looked up from plans, not retyped. */
  plan?: string;
  /** Seats/units of that plan. Default 1. */
  quantity?: number;
  /** Why we use it, first-hand (author's words). */
  why?: string;
  /** Tool slug of the free/cheaper swap for the budget version. */
  freeSwap?: Slug;
  /** First-hand notes, what didn't work. */
  notes?: string;
  /** Manual override only when the plan isn't in `plans` (e.g. usage-based); must carry a source. */
  costOverride?: { usdMonthly?: number | null; inrMonthly?: number | null; sourceUrl?: string; note?: string };
};

/**
 * Stack total monthly cost. PREFER COMPUTED: lib/data.ts sums items (plan price x quantity) at build time, so totals
 * update when prices change. Store this only to pin an approved figure; the validator warns if it drifts from computed.
 * Used by: /stacks/[stack] summary box, /stacks index cards, home stack cards.
 */
export type StackCost = {
  /** Total USD per month for the stack as written. */
  usdMonthly?: number | null;
  /** Total INR per month, only if every item publishes INR (else null; never mix/convert). */
  inrMonthly?: number | null;
  /** Total USD per month for the free/budget version (using freeSwap tools). */
  budgetUsdMonthly?: number | null;
  /** Items whose price is usage-based or unverified, so the total is shown as "from". */
  excludes?: Slug[];
  /** Date the total was last computed/checked. */
  computedAt?: ISODate;
};

export type Stack = Omit<ExistingStack, "items"> & Editorial & {
  items: StackItem[];
  /** Who it's for + summary (Ron §6.5 block 2). */
  summary?: string;
  /** Total monthly cost (see StackCost). */
  totalCost?: StackCost;
  /** "Free / budget version" paragraph. */
  budgetVersion?: string;
  /** "What we'd skip" bullets. */
  skip?: SourcedText[];
  /** Persona/job tag for grouping, e.g. "ecommerce", "education". */
  persona?: string;
  /** Approved FAQ. */
  faq?: FaqItem[];
};

// ---------------------------------------------------------------------------
// Categories (new root collection `db.categories`) and site-wide copy
// ---------------------------------------------------------------------------

/** Used by: /categories/[slug] (new listing template, Ron §8 P2), home category chips, tool breadcrumb. */
export type Category = Editorial & {
  /** URL id, e.g. "ai-coding-assistant". */
  slug?: Slug;
  /** Display name; must equal the tools' current `category` string during migration. */
  name?: string;
  /** 40-80 word intro. */
  intro?: string;
  /** schema.org applicationCategory (replaces the regex in tools/[tool]/page.tsx L20). */
  schemaCategory?: "DeveloperApplication" | "BusinessApplication" | "DesignApplication" | "MultimediaApplication" | "EducationalApplication";
  /** Approved FAQ. */
  faq?: FaqItem[];
  firstPublished?: ISODate;
  contentUpdatedAt?: ISODate;
};

/**
 * Site-wide copy and constants now inlined in TSX (see template-audit.md). New file src/data/site.json.
 * Used by: layout, about, changes, open-source, tool page, llms.txt, subscribe emails, OG images.
 */
export type SiteConfig = {
  brand?: string;                 // "FindBetterAlt"
  url?: string;                   // replaces literal URLs (ui.tsx L55, stacks/[stack] L16, robots.ts L4)
  email?: string;                 // hello@findbetteralt.com (7 literals today)
  priceTrackingStartedAt?: ISODate; // changes/page.tsx L5, L10 ("17 Oct 2026")
  githubStatsFetchedAt?: ISODate;   // open-source L10, tools/[tool] L33 ("Oct 2026")
  disclosure?: { affiliate?: string; pricePolicy?: string }; // layout L24-25, tools L30, about L10/L14
  statusLabels?: Partial<Record<NonNullable<ExistingTool["status"]>, string>>; // tools/[tool] L24
  setupDifficultyLegend?: Record<"1" | "2" | "3" | "4" | "5", string>;     // open-source L10
  thresholds?: { minItems?: number; jaccardMax?: number; introMinWords?: number; introMaxWords?: number; metaMaxChars?: number };
  /** Days since lastChecked after which a price shows the "Re-checking" badge (Neville's spec: 30). */
  staleAfterDays?: number;
  /** Human-readable re-check schedule used in methodology copy, e.g. "every Monday and Thursday". */
  recheckSchedule?: string;
  /** Extra disclosure copy (sponsored label tooltip, AI-assisted research note). */
  disclosures?: { sponsored?: string; aiAssisted?: string };
  /** Newsletter copy templates with {placeholders}; filled from changes[] at send time. */
  newsletter?: { subjectTemplate?: string; introTemplate?: string; noChangesNote?: string; footer?: string };
};

/** Full db.json shape after the additions. */
export type Db = {
  tools: Tool[]; anchors: Anchor[]; saas: Saas[]; stacks: Stack[]; changes: PriceChange[];
  /** NEW */ comparisons?: Comparison[];
  /** NEW */ people?: Person[];
  /** NEW */ categories?: Category[];
};
