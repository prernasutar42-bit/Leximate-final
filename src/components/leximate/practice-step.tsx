"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerButton } from "@/components/leximate/speaker-button";
import { WritePractice } from "@/components/leximate/write-practice";
import { cn } from "@/lib/utils";
import type { LexiMateMode } from "@/components/leximate/types";

type PracticeFeedback = "idle" | "listening" | "success" | "retry";
type PracticeMode = "say" | "write";

type PracticeStepProps = {
  mode: LexiMateMode;
  word: string;
  speaking: boolean;
  listening: boolean;
  recognitionSupported: boolean;
  feedback: PracticeFeedback;
  onSpeak: () => void;
  onListen: () => void;
  onSelfReport: () => void;
  onWriteSuccess: () => void;
  onTrack: () => void;
};

export function PracticeStep({
  mode,
  word,
  speaking,
  listening,
  recognitionSupported,
  feedback,
  onSpeak,
  onListen,
  onSelfReport,
  onWriteSuccess,
  onTrack,
}: PracticeStepProps) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("say");
  const isChild = mode === "child";

  const message = {
    idle: isChild
      ? "Listen first, then say the word out loud."
      : "Listen, then try the word when you are ready.",
    listening: isChild ? "We are listening. Take your time." : "Listening…",
    success: isChild ? "You said it! That was great." : "That matches. Nice work.",
    retry: isChild
      ? "Almost! Try once more when you are ready."
      : "Give it another try. You are close.",
  }[feedback];

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto grid w-full max-w-md grid-cols-2 rounded-lg border-2 bg-[#FFFAEF] p-1" role="tablist" aria-label="Practice mode">
        <button
          type="button"
          role="tab"
          aria-selected={practiceMode === "say"}
          className={cn("min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]", practiceMode === "say" ? "bg-orange-200" : "hover:bg-accent")}
          onClick={() => setPracticeMode("say")}
        >
          Say it
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={practiceMode === "write"}
          className={cn("min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]", practiceMode === "write" ? "bg-orange-200" : "hover:bg-accent")}
          onClick={() => setPracticeMode("write")}
        >
          Write it
        </button>
      </div>

      {practiceMode === "write" ? (
        <WritePractice mode={mode} word={word} onSuccess={onWriteSuccess} onTrack={onTrack} />
      ) : (
        <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Practice</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 text-center">
            <p className={cn("rounded-md bg-orange-200 px-4 py-3 font-bold", isChild ? "text-5xl" : "text-4xl")}>
              {word}
            </p>

            <p className={cn("max-w-md", isChild ? "text-xl" : "text-lg")} aria-live="polite">
              {message}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <SpeakerButton speaking={speaking} onSpeak={onSpeak} label="Listen again" />
              <Button type="button" variant="outline" className="min-h-11" onClick={onSpeak}>
                Listen again
              </Button>
            </div>

            <div className="flex w-full max-w-md flex-col gap-3">
              {recognitionSupported && (
                <Button type="button" className="min-h-11 w-full" onClick={onListen} disabled={listening} aria-label="Try saying it">
                  Try saying it
                </Button>
              )}

              <Button type="button" variant={recognitionSupported ? "outline" : "default"} className="min-h-11 w-full" onClick={onSelfReport}>
                I said it!
              </Button>

              {!recognitionSupported && (
                <p className="text-sm text-muted-foreground">
                  Voice listening is not available here. Use “I said it!” after you say the word.
                </p>
              )}
            </div>

            {feedback === "success" && (
              <Button type="button" className="min-h-11" onClick={onTrack}>
                See my progress
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
