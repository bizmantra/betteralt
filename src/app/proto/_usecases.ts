// Single source of truth for the prototype: drives listing, detail pages, role pages, menus and JSON-LD.
// Roles from /workspace/usecases/persona-workflows.md; content types from content-types.md.
// SEO fields (targetKeyword, volume) live in _seo.ts, a server-only module, so they never reach the browser bundle.
export type RoleSlug = "teacher" | "tutor" | "student" | "small-business" | "freelancer" | "lawyer" | "real-estate" | "healthcare-office";
export type ContentType = "free-tool" | "template" | "prompts" | "guide" | "comparison" | "checklist";
export type Topic = "Planning" | "Feedback" | "Email & letters" | "Studying" | "Documents" | "Marketing" | "Privacy & rules";
export type JobType = "Create" | "Write" | "Summarise" | "Review" | "Choose";
export type Status = "live" | "coming-soon";
export type UseCase = {
  slug: string; title: string; outcome: string; problem: string;
  roles: RoleSlug[];            // first role = primary; several allowed
  topic: Topic; jobType: JobType;
  contentTypes: ContentType[];  // what the page offers
  toolName?: string;            // name of the in-browser free tool, if any
  relatedTools: string[];       // existing tool slugs in src/data/db.json
  status: Status;
};
export type Role = { slug: RoleSlug; label: string; plural: string; inMenu: boolean; audience: { type: "EducationalAudience" | "BusinessAudience" | "Audience"; name: string }; related: RoleSlug[]; full: boolean };
export const ROLES: Role[] = [
  { slug: "teacher", label: "Teacher", plural: "Teachers", inMenu: true, audience: { type: "EducationalAudience", name: "teacher" }, related: ["tutor", "student"], full: true },
  { slug: "tutor", label: "Tutor", plural: "Tutors", inMenu: false, audience: { type: "EducationalAudience", name: "tutor" }, related: ["teacher", "student"], full: false },
  { slug: "student", label: "Student", plural: "Students", inMenu: true, audience: { type: "EducationalAudience", name: "student" }, related: ["teacher", "tutor"], full: false },
  { slug: "small-business", label: "Small business", plural: "Small business", inMenu: true, audience: { type: "BusinessAudience", name: "small business owner" }, related: ["freelancer", "real-estate"], full: true },
  { slug: "freelancer", label: "Freelancer", plural: "Freelancers", inMenu: true, audience: { type: "BusinessAudience", name: "freelancer" }, related: ["small-business"], full: false },
  { slug: "lawyer", label: "Legal", plural: "Legal", inMenu: true, audience: { type: "Audience", name: "lawyer" }, related: ["small-business", "healthcare-office"], full: false },
  { slug: "real-estate", label: "Real estate", plural: "Real estate", inMenu: true, audience: { type: "BusinessAudience", name: "real estate agent" }, related: ["small-business", "freelancer"], full: false },
  { slug: "healthcare-office", label: "Healthcare office", plural: "Healthcare office", inMenu: false, audience: { type: "Audience", name: "healthcare office staff" }, related: ["small-business"], full: false },
];
export const CT: Record<ContentType, { label: string; plural: string }> = {
  "free-tool": { label: "Free tool", plural: "Free tools" }, template: { label: "Template", plural: "Templates" }, prompts: { label: "Prompts", plural: "Prompts" },
  guide: { label: "Guide", plural: "Guides" }, comparison: { label: "Comparison", plural: "Comparisons" }, checklist: { label: "Checklist", plural: "Policies & checklists" },
};
export const TOPICS: Topic[] = ["Planning", "Feedback", "Email & letters", "Studying", "Documents", "Marketing", "Privacy & rules"];
export const TYPES: JobType[] = ["Create", "Write", "Summarise", "Review", "Choose"];
const U = (u: UseCase) => u;
export const USE_CASES: UseCase[] = [
  U({ slug: "plan-a-lesson", title: "Plan a lesson", outcome: "A timed lesson plan you can print and teach from", problem: "Planning a lesson from scratch takes time you don't have, and a blank page makes it slower.", roles: ["teacher", "tutor"], topic: "Planning", jobType: "Create", contentTypes: ["free-tool", "template", "prompts", "guide"], toolName: "Lesson plan builder", relatedTools: ["chatgpt", "gemini", "magicschool"], status: "live" }),
  U({ slug: "write-report-card-comments", title: "Write report card comments", outcome: "Kind, specific comments you can edit for each student", problem: "Writing a fresh, kind and specific comment for every student takes hours, and they start to sound the same.", roles: ["teacher", "tutor"], topic: "Feedback", jobType: "Write", contentTypes: ["free-tool", "prompts", "guide"], toolName: "Report card comment builder", relatedTools: ["chatgpt", "claude", "magicschool"], status: "live" }),
  U({ slug: "write-a-professional-email", title: "Write a follow-up email to a client", outcome: "A polished email draft, ready to send", problem: "You know what you want to say, but getting the wording polite, clear and short takes longer than it should.", roles: ["small-business", "freelancer", "real-estate"], topic: "Email & letters", jobType: "Write", contentTypes: ["free-tool", "template", "prompts", "guide"], toolName: "Email builder", relatedTools: ["chatgpt", "claude", "grammarly", "gemini"], status: "live" }),
  U({ slug: "make-a-quiz-from-a-pdf", title: "Make a quiz from a PDF", outcome: "A 10-question quiz with an answer key", problem: "", roles: ["teacher", "tutor"], topic: "Planning", jobType: "Create", contentTypes: ["guide", "prompts", "comparison"], relatedTools: ["magicschool", "quizlet", "khanmigo", "chatgpt"], status: "coming-soon" }),
  U({ slug: "make-a-rubric", title: "Make a marking rubric", outcome: "A clear 4-level rubric for any assignment", problem: "", roles: ["teacher"], topic: "Feedback", jobType: "Create", contentTypes: ["template", "prompts"], relatedTools: ["magicschool", "chatgpt"], status: "coming-soon" }),
  U({ slug: "give-feedback-on-an-essay", title: "Give feedback on an essay", outcome: "Draft feedback you check and finish", problem: "", roles: ["teacher", "tutor"], topic: "Feedback", jobType: "Review", contentTypes: ["guide", "prompts"], relatedTools: ["magicschool", "claude", "grammarly"], status: "coming-soon" }),
  U({ slug: "free-ai-tools-for-teaching-compared", title: "Compare free AI tools for lesson prep", outcome: "What each free plan really gets you, side by side", problem: "", roles: ["teacher"], topic: "Planning", jobType: "Choose", contentTypes: ["comparison"], relatedTools: ["magicschool", "khanmigo", "chatgpt", "gemini"], status: "coming-soon" }),
  U({ slug: "make-a-study-guide", title: "Make a study guide from your notes", outcome: "A one-page guide plus practice questions", problem: "", roles: ["student", "tutor"], topic: "Studying", jobType: "Summarise", contentTypes: ["template", "prompts", "guide"], relatedTools: ["quizlet", "chatgpt", "notion-ai"], status: "coming-soon" }),
  U({ slug: "turn-notes-into-flashcards", title: "Turn notes into flashcards", outcome: "A flashcard set you can study on your phone", problem: "", roles: ["student"], topic: "Studying", jobType: "Create", contentTypes: ["guide", "prompts"], relatedTools: ["quizlet", "chatgpt"], status: "coming-soon" }),
  U({ slug: "explain-a-hard-topic", title: "Get a hard topic explained step by step", outcome: "A plain-words explanation, not just the answer", problem: "", roles: ["student", "tutor"], topic: "Studying", jobType: "Summarise", contentTypes: ["guide", "comparison"], relatedTools: ["khanmigo", "wolfram-alpha", "chatgpt"], status: "coming-soon" }),
  U({ slug: "cite-chatgpt", title: "Cite ChatGPT in your work", outcome: "The right citation format, with examples", problem: "", roles: ["student", "teacher"], topic: "Privacy & rules", jobType: "Write", contentTypes: ["checklist", "guide"], relatedTools: ["chatgpt"], status: "coming-soon" }),
  U({ slug: "summarise-a-contract", title: "Summarise a contract", outcome: "A plain-words summary and a list of points to check", problem: "", roles: ["lawyer", "small-business", "freelancer"], topic: "Documents", jobType: "Summarise", contentTypes: ["guide", "prompts"], relatedTools: ["claude", "chatgpt", "ollama", "lm-studio"], status: "coming-soon" }),
  U({ slug: "transcribe-and-summarise-a-call", title: "Turn a recorded call into notes", outcome: "A transcript and a short summary", problem: "", roles: ["lawyer", "freelancer", "small-business"], topic: "Documents", jobType: "Summarise", contentTypes: ["guide", "comparison"], relatedTools: ["otter", "whisper"], status: "coming-soon" }),
  U({ slug: "draft-a-client-letter", title: "Draft a letter to a client", outcome: "A clear, polite letter you review before sending", problem: "", roles: ["lawyer", "freelancer"], topic: "Email & letters", jobType: "Write", contentTypes: ["template", "prompts"], relatedTools: ["claude", "chatgpt"], status: "coming-soon" }),
  U({ slug: "reply-to-a-review", title: "Reply to a customer review", outcome: "A calm, friendly reply for good or bad reviews", problem: "", roles: ["small-business", "real-estate"], topic: "Marketing", jobType: "Write", contentTypes: ["template", "prompts"], relatedTools: ["chatgpt", "claude"], status: "coming-soon" }),
  U({ slug: "make-a-flyer", title: "Make a flyer", outcome: "A print or social-media flyer from a short brief", problem: "", roles: ["small-business", "real-estate", "teacher"], topic: "Marketing", jobType: "Create", contentTypes: ["guide", "comparison"], relatedTools: ["canva", "adobe-express"], status: "coming-soon" }),
  U({ slug: "write-a-newsletter", title: "Write a customer newsletter", outcome: "A short newsletter in your own voice", problem: "", roles: ["small-business", "freelancer"], topic: "Marketing", jobType: "Write", contentTypes: ["template", "prompts"], relatedTools: ["chatgpt", "rytr"], status: "coming-soon" }),
  U({ slug: "make-an-invoice", title: "Make an invoice from a spreadsheet", outcome: "A tidy invoice you can send as a PDF", problem: "", roles: ["freelancer", "small-business"], topic: "Documents", jobType: "Create", contentTypes: ["template", "guide"], relatedTools: ["google-sheets", "zapier"], status: "coming-soon" }),
  U({ slug: "ai-use-policy", title: "Write an AI use policy for your team", outcome: "A one-page policy: what's allowed, what's not", problem: "", roles: ["small-business", "lawyer"], topic: "Privacy & rules", jobType: "Write", contentTypes: ["checklist", "template"], relatedTools: ["chatgpt", "claude"], status: "coming-soon" }),
  U({ slug: "write-a-listing-description", title: "Write a property listing description", outcome: "A clear, fair listing description to edit", problem: "", roles: ["real-estate"], topic: "Marketing", jobType: "Write", contentTypes: ["template", "prompts"], relatedTools: ["chatgpt", "claude"], status: "coming-soon" }),
];
export const role = (s: string) => ROLES.find((r) => r.slug === s);
export const forRole = (s: RoleSlug) => USE_CASES.filter((u) => u.roles.includes(s));
