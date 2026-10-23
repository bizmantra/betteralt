import "server-only";
// INTERNAL ONLY. Ron's DataForSEO US monthly volumes (23 Oct 2026). Joined onto the use-case model on the server; never rendered or shipped to the client.
import { USE_CASES, type UseCase } from "./_usecases";
export type SeoFields = { targetKeyword: string | null; volume: number | null };
export type UseCaseWithSeo = UseCase & SeoFields;
const SEO: Record<string, SeoFields> = {
  "plan-a-lesson": { targetKeyword: "lesson plan template", volume: 18100 },
  "write-report-card-comments": { targetKeyword: "report card comments", volume: 2900 },
  "write-a-professional-email": { targetKeyword: "ai email generator", volume: 12100 },
  "make-a-quiz-from-a-pdf": { targetKeyword: "ai quiz generator", volume: 2900 },
  "make-a-rubric": { targetKeyword: "rubric generator", volume: 2900 },
  "give-feedback-on-an-essay": { targetKeyword: "ai essay grader", volume: 1900 },
  "free-ai-tools-for-teaching-compared": { targetKeyword: "best ai for teachers", volume: 720 },
  "make-a-study-guide": { targetKeyword: "study guide maker", volume: 6600 },
  "turn-notes-into-flashcards": { targetKeyword: "ai flashcard maker", volume: 3600 },
  "explain-a-hard-topic": { targetKeyword: "ai tutor", volume: 6600 },
  "cite-chatgpt": { targetKeyword: "how to cite chatgpt", volume: 2400 },
  "summarise-a-contract": { targetKeyword: "ai contract review", volume: 880 },
  "transcribe-and-summarise-a-call": { targetKeyword: "legal transcription", volume: 590 },
  "draft-a-client-letter": { targetKeyword: null, volume: null },
  "reply-to-a-review": { targetKeyword: null, volume: null },
  "make-a-flyer": { targetKeyword: "ai flyer generator", volume: 5400 },
  "write-a-newsletter": { targetKeyword: "ai email marketing", volume: 590 },
  "make-an-invoice": { targetKeyword: "ai invoice generator", volume: 480 },
  "ai-use-policy": { targetKeyword: "ai policy template", volume: 320 },
  "write-a-listing-description": { targetKeyword: null, volume: null },
};
export const withSeo = (): UseCaseWithSeo[] => USE_CASES.map((u) => ({ ...u, ...(SEO[u.slug] ?? { targetKeyword: null, volume: null }) }));
