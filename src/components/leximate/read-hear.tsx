"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SpeakerButton } from "@/components/leximate/speaker-button";
import { cn } from "@/lib/utils";
import type { LexiMateMode } from "@/components/leximate/types";
import { PARAGRAPHS } from "@/components/leximate/types";

type ReadHearProps = {
  mode: LexiMateMode;
  selectedWord: string | null;
  speaking: boolean;
  onSelectWord: (word: string) => void;
  onSpeak: (word: string) => void;
  onPractice: () => void;
};

function stripPunctuation(token: string): string {
  return token.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, "");
}

export function ReadHear({
  mode,
  selectedWord,
  speaking,
  onSelectWord,
  onSpeak,
  onPractice,
}: ReadHearProps) {
  const [openWord, setOpenWord] = useState<string | null>(null);
  const paragraph = PARAGRAPHS[mode];
  const tokens = useMemo(() => paragraph.split(/(\s+)/), [paragraph]);
  const isChild = mode === "child";

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">
            {isChild ? "Tap a word you want help with" : "Tap a word to hear and practice it"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "flex flex-wrap items-center",
              isChild ? "text-2xl leading-loose sm:text-3xl" : "text-xl leading-relaxed sm:text-2xl"
            )}
          >
            {tokens.map((token, index) => {
              if (/^\s+$/.test(token)) {
                return <span key={`s-${index}`}>{token}</span>;
              }

              const word = stripPunctuation(token);
              if (!word) {
                return <span key={`p-${index}`}>{token}</span>;
              }

              const isSelected = selectedWord?.toLowerCase() === word.toLowerCase();

              return (
                <Popover
                  key={`w-${index}`}
                  open={openWord === `${index}-${word}`}
                  onOpenChange={(open) => {
                    setOpenWord(open ? `${index}-${word}` : null);
                    if (open) {
                      onSelectWord(word);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-md px-1.5 py-1 transition-all",
                        "hover:bg-yellow-200",
                        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                        isSelected && "bg-orange-200"
                      )}
                    >
                      {token}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-[#FFFAEF] text-[#020402]">
                    <div className="flex flex-col gap-3">
                      <p className={cn("font-semibold", isChild ? "text-2xl" : "text-xl")}>
                        {word}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <SpeakerButton
                          speaking={speaking && selectedWord === word}
                          onSpeak={() => onSpeak(word)}
                        />
                        <Button
                          type="button"
                          className="min-h-11"
                          onClick={onPractice}
                        >
                          Practice this word
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </p>
        </CardContent>
      </Card>

      {selectedWord && (
        <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
          <CardHeader>
            <CardTitle className="text-xl">Hear</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className={cn(
                "rounded-md bg-orange-200 px-3 py-2 font-semibold",
                isChild ? "text-3xl" : "text-2xl"
              )}
            >
              {selectedWord}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <SpeakerButton
                speaking={speaking}
                onSpeak={() => onSpeak(selectedWord)}
              />
              {speaking && (
                <span className="rounded-md bg-yellow-200 px-2 py-1 text-sm">
                  Speaking…
                </span>
              )}
              <Button type="button" className="min-h-11" onClick={onPractice}>
                Practice this word
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
