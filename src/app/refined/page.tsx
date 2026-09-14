"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { canSpeak } from "@/components/leximate/speech";

function formatLines(text: string) {
  return text
    .replace(/\.\s*/g, ".\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Refined() {
  const [defaultText, setDefaultText] = useState("");
  const [summary, setSummary] = useState("");
  const [rephrased, setRephrased] = useState("");
  const [level, setLevel] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<"none" | "refined" | "summary">("none");
  const [speechSupported, setSpeechSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSpeechSupported(canSpeak());
    const savedText = sessionStorage.getItem("pdfText") || "";
    setDefaultText(savedText);
    if (!savedText) {
      setError("No uploaded text yet. Go back and choose a file first.");
    }
  }, []);

  useEffect(() => {
    if (!defaultText) {
      return;
    }

    const controller = new AbortController();
    const fetchRefinedText = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/ai-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputText: defaultText,
            readingLevel: level,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not refine the text.");
        }
        setSummary(data.summary || "");
        setRephrased(data.rephrased || defaultText);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error calling AI API:", err);
        setError("Showing the original text while refine is unavailable.");
        setRephrased(defaultText);
        setSummary(defaultText.split(/(?<=[.!?])\s+/).slice(0, 3).join(" "));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRefinedText();
    return () => controller.abort();
  }, [defaultText, level]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const displayText = rephrased || defaultText;
  const formattedRephrased = formatLines(displayText);

  function stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setPlaying("none");
  }

  function speak(kind: "refined" | "summary", text: string) {
    if (playing === kind) {
      stopSpeech();
      return;
    }
    if (!canSpeak() || !text) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.onend = () => setPlaying("none");
    utterance.onerror = () => setPlaying("none");
    utteranceRef.current = utterance;
    setPlaying(kind);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="grid min-h-screen w-full max-w-full grid-cols-1 gap-4 overflow-x-hidden p-4 lg:grid-cols-[1.5fr_3fr_3fr]">
      <div className="border-2 bg-[#FFFAEF] p-4 text-[#020402]">
        <h2 className="mb-2 pb-12 pt-2 text-3xl font-bold">Adjustments</h2>
        <h3 className="pb-4 text-xl font-bold">Difficulty</h3>
        <RadioGroup value={level} onValueChange={setLevel}>
          <div className="flex min-h-11 items-center space-x-2">
            <RadioGroupItem value="mild" id="mild" />
            <Label htmlFor="mild" className="text-lg font-bold">
              Mild
            </Label>
          </div>
          <div className="flex min-h-11 items-center space-x-2">
            <RadioGroupItem value="moderate" id="moderate" />
            <Label htmlFor="moderate" className="text-lg font-bold">
              Moderate
            </Label>
          </div>
          <div className="flex min-h-11 items-center space-x-2">
            <RadioGroupItem value="severe" id="severe" />
            <Label htmlFor="severe" className="text-lg font-bold">
              Severe
            </Label>
          </div>
        </RadioGroup>
        {error ? (
          <p className="mt-6 text-sm font-medium" role="status">
            {error}
          </p>
        ) : null}
        <Button asChild variant="outline" className="mt-8 min-h-11">
          <Link href="/upload">Upload another file</Link>
        </Button>
      </div>

      <div className="h-full overflow-y-auto border-2 bg-[#FFFAEF] p-4 text-[#020402]">
        <div className="flex flex-row items-center gap-4 pb-6 pt-2">
          <h2 className="mb-2 text-4xl font-bold">Refined Text</h2>
          <Button
            className="min-h-11 min-w-11"
            onClick={() => speak("refined", displayText)}
            disabled={!speechSupported || !displayText}
            aria-label={playing === "refined" ? "Pause refined text" : "Play refined text"}
          >
            {playing === "refined" ? <PauseCircle size={40} /> : <Volume2 size={40} />}
          </Button>
        </div>
        <div className="space-y-4 text-xl font-bold leading-10">
          {loading && !displayText ? <p>Preparing easier text…</p> : null}
          {formattedRephrased.map((line, index) => (
            <p key={`${index}-${line.slice(0, 12)}`}>{line}</p>
          ))}
        </div>
      </div>

      <div className="h-full overflow-y-auto border-2 bg-[#FFFAEF] p-4 text-[#020402]">
        <div className="flex flex-row items-center gap-4 pb-6 pt-2">
          <h2 className="mb-2 text-4xl font-bold">Summary</h2>
          <Button
            className="min-h-11 min-w-11"
            onClick={() => speak("summary", summary)}
            disabled={!speechSupported || !summary}
            aria-label={playing === "summary" ? "Pause summary" : "Play summary"}
          >
            {playing === "summary" ? <PauseCircle size={40} /> : <Volume2 size={40} />}
          </Button>
        </div>
        <div className="space-y-4 text-xl font-bold leading-10">
          <p>
            {summary ||
              (loading ? "Loading summary… just a second!" : "Summary will appear here.")}
          </p>
        </div>
      </div>
    </div>
  );
}
