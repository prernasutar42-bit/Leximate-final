import {
  PROGRESS_STORAGE_KEY,
  type ProgressEntry,
} from "@/components/leximate/types";

export function loadProgress(): ProgressEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ProgressEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.word === "string" &&
        (entry.mode === "child" || entry.mode === "adult") &&
        typeof entry.timestamp === "string"
    );
  } catch {
    return [];
  }
}

export function saveProgress(entries: ProgressEntry[]): void {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(entries));
}

export function uniqueWords(entries: ProgressEntry[]): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const entry of entries) {
    const key = entry.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      words.push(entry.word);
    }
  }
  return words;
}
