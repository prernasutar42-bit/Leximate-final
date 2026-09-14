export const runtime = "nodejs";

import OpenAI from "openai";
import { localRefine, parseModelJson, truncateForAi } from "@/lib/refine-text";

export async function POST(req: Request) {
  const { inputText, readingLevel } = await req.json();
  const source = typeof inputText === "string" ? inputText.trim() : "";
  const level = typeof readingLevel === "string" ? readingLevel : "moderate";

  if (!source) {
    return Response.json({ error: "No text to process." }, { status: 400 });
  }

  const fallback = localRefine(source, level);

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(fallback);
    }

    const openai = new OpenAI({ apiKey });
    const clipped = truncateForAi(source);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You help people with dyslexia. Reply with ONLY valid JSON: {\"summary\":\"...\",\"rephrased\":\"...\"}. Put a newline after each sentence in rephrased. Keep language clear and friendly.",
        },
        {
          role: "user",
          content: `Reading level: ${level}.\n\nText:\n${clipped}\n\nSummarize briefly, then rephrase the text at that reading level.`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";
    const parsed = parseModelJson(raw);

    return Response.json({
      summary: parsed.summary || fallback.summary,
      rephrased: parsed.rephrased || fallback.rephrased,
    });
  } catch (error) {
    console.error("AI Process Error:", error);
    return Response.json(fallback);
  }
}
