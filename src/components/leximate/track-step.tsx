"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SESSION_GOAL, type LexiMateMode } from "@/components/leximate/types";

type TrackStepProps = {
  mode: LexiMateMode;
  words: string[];
  onReadAgain: () => void;
};

export function TrackStep({ mode, words, onReadAgain }: TrackStepProps) {
  const isChild = mode === "child";
  const total = words.length;
  const percent = Math.min(100, Math.round((total / SESSION_GOAL) * 100));

  return (
    <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Track</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className={isChild ? "text-xl" : "text-lg"}>
          {isChild
            ? `You practiced ${total} ${total === 1 ? "word" : "words"}. Keep going!`
            : `${total} ${total === 1 ? "word" : "words"} practiced this session.`}
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>Session goal</span>
            <span className="tabular-nums">
              {total}/{SESSION_GOAL}
            </span>
          </div>
          <div
            className="h-4 w-full overflow-hidden rounded-md border-2 bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={SESSION_GOAL}
            aria-valuenow={Math.min(total, SESSION_GOAL)}
            aria-label="Session practice goal"
          >
            <div
              className="h-full bg-green-200 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {words.length === 0 ? (
            <p className="text-muted-foreground">
              Words you practice will show up here.
            </p>
          ) : (
            words.map((word) => (
              <span
                key={word}
                className="inline-flex min-h-11 items-center rounded-md border-2 bg-yellow-200 px-3 text-base text-[#020402]"
              >
                {word}
              </span>
            ))
          )}
        </div>

        <Button type="button" variant="outline" className="min-h-11 w-fit" onClick={onReadAgain}>
          Practice another word
        </Button>
      </CardContent>
    </Card>
  );
}
