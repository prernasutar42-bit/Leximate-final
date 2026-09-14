import type { LexiMateMode } from "@/components/leximate/types";

export function getSpeechRate(mode: LexiMateMode): number {
  return mode === "child" ? 0.7 : 0.8;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function normalizeSpoken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9']/g, "");
}

export function spokenMatches(transcript: string, target: string): boolean {
  const expected = normalizeSpoken(target);
  if (!expected) {
    return false;
  }
  const words = transcript
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeSpoken)
    .filter(Boolean);
  return words.includes(expected) || normalizeSpoken(transcript) === expected;
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function speakWord(word: string, rate: number, onEnd: () => void): boolean {
  if (!canSpeak()) {
    onEnd();
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = rate;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
}
