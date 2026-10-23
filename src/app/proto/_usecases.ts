// Use cases drawn from /workspace/usecases/persona-workflows.md and usecases-research.md.
// No audience labels: filter by topic and job type. Time saved is omitted everywhere (no sourced figure yet).
export type UC = { slug: string; title: string; outcome: string; topic: string; type: string; tool?: string; live: boolean };
export const TOPICS = ["Planning", "Feedback", "Email & letters", "Studying", "Documents", "Marketing"];
export const TYPES = ["Create", "Write", "Summarise", "Review"];
export const USE_CASES: UC[] = [
  { slug: "plan-a-lesson", title: "Plan a lesson", outcome: "A timed lesson plan you can print and teach from", topic: "Planning", type: "Create", tool: "Lesson plan builder", live: true },
  { slug: "write-report-card-comments", title: "Write report card comments", outcome: "Kind, specific comments you can edit for each student", topic: "Feedback", type: "Write", tool: "Report card comment builder", live: true },
  { slug: "write-a-professional-email", title: "Write a follow-up email to a client", outcome: "A polished email draft, ready to send", topic: "Email & letters", type: "Write", tool: "Email builder", live: true },
  { slug: "make-a-quiz-from-a-pdf", title: "Make a quiz from a PDF", outcome: "A 10-question quiz with an answer key", topic: "Planning", type: "Create", live: false },
  { slug: "make-a-rubric", title: "Make a marking rubric", outcome: "A clear 4-level rubric for any assignment", topic: "Feedback", type: "Create", live: false },
  { slug: "give-feedback-on-an-essay", title: "Give feedback on an essay", outcome: "Draft feedback you check and finish", topic: "Feedback", type: "Review", live: false },
  { slug: "make-a-study-guide", title: "Make a study guide from your notes", outcome: "A one-page guide plus practice questions", topic: "Studying", type: "Summarise", live: false },
  { slug: "turn-notes-into-flashcards", title: "Turn notes into flashcards", outcome: "A flashcard set you can study on your phone", topic: "Studying", type: "Create", live: false },
  { slug: "explain-a-hard-topic", title: "Get a hard topic explained step by step", outcome: "A plain-words explanation, not just the answer", topic: "Studying", type: "Summarise", live: false },
  { slug: "summarise-a-contract", title: "Summarise a contract", outcome: "A plain-words summary and a list of points to check", topic: "Documents", type: "Summarise", live: false },
  { slug: "transcribe-and-summarise-a-call", title: "Turn a recorded call into notes", outcome: "A transcript and a short summary", topic: "Documents", type: "Summarise", live: false },
  { slug: "draft-a-client-letter", title: "Draft a letter to a client", outcome: "A clear, polite letter you review before sending", topic: "Email & letters", type: "Write", live: false },
  { slug: "reply-to-a-review", title: "Reply to a customer review", outcome: "A calm, friendly reply for good or bad reviews", topic: "Marketing", type: "Write", live: false },
  { slug: "make-a-flyer", title: "Make a flyer", outcome: "A print or social-media flyer from a short brief", topic: "Marketing", type: "Create", live: false },
  { slug: "write-a-newsletter", title: "Write a customer newsletter", outcome: "A short newsletter in your own voice", topic: "Marketing", type: "Write", live: false },
  { slug: "make-an-invoice", title: "Make an invoice from a spreadsheet", outcome: "A tidy invoice you can send as a PDF", topic: "Documents", type: "Create", live: false },
];
