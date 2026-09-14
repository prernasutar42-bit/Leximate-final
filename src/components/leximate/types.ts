export type LexiMateMode = "child" | "adult";

export type FlowStep = "personalization" | "read" | "hear" | "practice" | "track";

export type LexiMateStep = "mode" | FlowStep;

export const FLOW_STEPS: { id: FlowStep; label: string }[] = [
  { id: "personalization", label: "Personalize" },
  { id: "read", label: "Read" },
  { id: "hear", label: "Hear" },
  { id: "practice", label: "Practice" },
  { id: "track", label: "Track" },
];

export const SESSION_GOAL = 5;
export const PROGRESS_STORAGE_KEY = "leximate-progress";

export type ProgressEntry = {
  word: string;
  mode: LexiMateMode;
  timestamp: string;
  method?: "say" | "write";
};

export const PARAGRAPHS: Record<LexiMateMode, string> = {
  child:
    "The sun is warm today. A small bird sits on a green tree. It sings a happy song. We can sit and listen.",
  adult:
    "Reading gets easier with small, steady steps. When a word feels tricky, pause and look at it closely. Hear how it sounds, then try saying it yourself. Each try helps your brain remember the pattern.",
};
