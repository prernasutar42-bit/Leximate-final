const MAX_AI_CHARS = 3500;

export function truncateForAi(text: string): string {
  if (text.length <= MAX_AI_CHARS) {
    return text;
  }
  return `${text.slice(0, MAX_AI_CHARS).trim()}…`;
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function simplifyWords(text: string): string {
  return text
    .replace(/\bhowever\b/gi, "but")
    .replace(/\btherefore\b/gi, "so")
    .replace(/\bapproximately\b/gi, "about")
    .replace(/\butilize\b/gi, "use")
    .replace(/\bdemonstrate\b/gi, "show")
    .replace(/\badditional\b/gi, "more")
    .replace(/\bimportant\b/gi, "key");
}

export function localRefine(text: string, readingLevel: string) {
  const sentences = splitSentences(text);
  const summary = sentences.slice(0, 3).join(" ") || text.slice(0, 240);

  if (readingLevel === "severe") {
    const rephrased = sentences
      .map((sentence) => {
        const short = simplifyWords(sentence).replace(/,\s+/g, ". ");
        return short.length > 90 ? `${short.slice(0, 87).trim()}…` : short;
      })
      .join("\n");
    return { summary: simplifyWords(summary), rephrased };
  }

  if (readingLevel === "mild") {
    return {
      summary,
      rephrased: sentences.join("\n"),
    };
  }

  return {
    summary: simplifyWords(summary),
    rephrased: sentences.map(simplifyWords).join("\n"),
  };
}

export function parseModelJson(raw: string): { summary?: string; rephrased?: string } {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model did not return JSON");
    }
    return JSON.parse(match[0]);
  }
}
