"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LexiMateStepHeader } from "@/components/leximate/step-header";
import { ModeSelect } from "@/components/leximate/mode-select";
import { PersonalizationQuiz } from "@/components/leximate/personalization-quiz";
import { ReadHear } from "@/components/leximate/read-hear";
import { PracticeStep } from "@/components/leximate/practice-step";
import { TrackStep } from "@/components/leximate/track-step";
import {
  loadProgress,
  saveProgress,
  uniqueWords,
} from "@/components/leximate/progress";
import {
  getSpeechRate,
  getSpeechRecognition,
  speakWord,
  spokenMatches,
} from "@/components/leximate/speech";
import {
  FLOW_STEPS,
  SESSION_GOAL,
  type FlowStep,
  type LexiMateMode,
  type LexiMateStep,
  type ProgressEntry,
} from "@/components/leximate/types";

type PracticeFeedback = "idle" | "listening" | "success" | "retry";

export default function LexiMatePage() {
  const [mode, setMode] = useState<LexiMateMode | null>(null);
  const [step, setStep] = useState<LexiMateStep>("mode");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<PracticeFeedback>("idle");
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef<{ abort: () => void } | null>(null);

  useEffect(() => {
    setEntries(loadProgress());
    setRecognitionSupported(Boolean(getSpeechRecognition()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const flowStep: FlowStep = step === "mode" ? "personalization" : step;
  const showBack = step !== "mode";
  const practicedWords = uniqueWords(entries);

  function goBack() {
    if (step === "personalization") {
      setStep("mode");
      return;
    }
    const index = FLOW_STEPS.findIndex((item) => item.id === step);
    if (index > 0) {
      setStep(FLOW_STEPS[index - 1].id);
    }
  }

  function goToStep(next: FlowStep) {
    if (!mode) {
      return;
    }
    setStep(next);
  }

  function selectMode(nextMode: LexiMateMode) {
    setMode(nextMode);
    setSelectedWord(null);
    setFeedback("idle");
    setStep("personalization");
  }

  function completePersonalization() {
    // Stage 1 bridge: Stage 2/3 will replace this with scoring + Profile Summary.
    setStep("read");
  }

  function speak(word: string) {
    if (!mode) {
      return;
    }
    setSpeaking(true);
    const started = speakWord(word, getSpeechRate(mode), () => setSpeaking(false));
    if (!started) {
      setSpeaking(false);
    }
  }

  function recordSuccess(word: string, method: "say" | "write" = "say") {
    if (!mode) {
      return;
    }
    const entry: ProgressEntry = {
      word,
      mode,
      timestamp: new Date().toISOString(),
      method,
    };
    const next = [...entries, entry];
    setEntries(next);
    saveProgress(next);
    setFeedback("success");
  }

  function listen() {
    const Recognition = getSpeechRecognition();
    if (!Recognition || !selectedWord) {
      return;
    }

    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setListening(true);
    setFeedback("listening");

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (spokenMatches(transcript, selectedWord)) {
        recordSuccess(selectedWord);
      } else {
        setFeedback("retry");
      }
    };
    recognition.onerror = () => {
      setFeedback("retry");
    };
    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      setFeedback("retry");
    }
  }

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col items-center overflow-x-hidden p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6 py-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-11"
                onClick={goBack}
                aria-label="Go back"
              >
                <ChevronLeft />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <h1 className="text-3xl font-bold sm:text-4xl">
              <span className="rounded-md bg-orange-200 px-2 py-1">LexiMate</span>
            </h1>
          </div>

          {step !== "mode" && (
            <LexiMateStepHeader
              currentStep={flowStep}
              wordsPracticed={practicedWords.length}
              sessionGoal={SESSION_GOAL}
              onSelectStep={goToStep}
            />
          )}
        </header>

        {step === "mode" && <ModeSelect onSelect={selectMode} />}

        {step === "personalization" && mode && (
          <PersonalizationQuiz mode={mode} onComplete={completePersonalization} />
        )}

        {(step === "read" || step === "hear") && mode && (
          <ReadHear
            mode={mode}
            selectedWord={selectedWord}
            speaking={speaking}
            onSelectWord={(word) => {
              setSelectedWord(word);
              setFeedback("idle");
              setStep("hear");
            }}
            onSpeak={speak}
            onPractice={() => {
              if (selectedWord) {
                setFeedback("idle");
                setStep("practice");
              }
            }}
          />
        )}

        {step === "practice" && mode && selectedWord && (
          <PracticeStep
            mode={mode}
            word={selectedWord}
            speaking={speaking}
            listening={listening}
            recognitionSupported={recognitionSupported}
            feedback={feedback}
            onSpeak={() => speak(selectedWord)}
            onListen={listen}
            onSelfReport={() => recordSuccess(selectedWord, "say")}
            onWriteSuccess={() => recordSuccess(selectedWord, "write")}
            onTrack={() => setStep("track")}
          />
        )}

        {step === "practice" && !selectedWord && (
          <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
            <CardHeader>
              <CardTitle className="text-2xl">Practice</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Choose a word on the Read step first.</p>
              <Button type="button" className="min-h-11 w-fit" onClick={() => setStep("read")}>
                Go to Read
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "track" && mode && (
          <TrackStep
            mode={mode}
            words={practicedWords}
            onReadAgain={() => setStep("read")}
          />
        )}
      </div>
    </div>
  );
}
