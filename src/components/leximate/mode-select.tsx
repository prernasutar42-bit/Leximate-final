"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LexiMateMode } from "@/components/leximate/types";

type ModeSelectProps = {
  onSelect: (mode: LexiMateMode) => void;
};

const MODES: {
  id: LexiMateMode;
  title: string;
  description: string;
  highlight: string;
}[] = [
  {
    id: "child",
    title: "Child",
    description: "Bigger words, a short story, and extra-kind practice.",
    highlight: "bg-yellow-200",
  },
  {
    id: "adult",
    title: "Adult",
    description: "A fuller paragraph and calm, steady practice.",
    highlight: "bg-green-200",
  },
];

export function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold sm:text-3xl">Who is practicing?</h2>
      <p className="text-lg text-[#020402]">
        Choose a mode. We will ask a few quick questions first, then build your reading support profile.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className={cn(
              "min-h-[11rem] rounded-xl border-2 bg-[#FFFAEF] text-left text-[#020402] shadow-sm transition-all",
              "hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
            )}
          >
            <Card className="h-full border-0 bg-transparent py-4 shadow-none">
              <CardHeader>
                <CardTitle className="text-3xl">
                  <span className={cn("rounded-md px-2 py-1", mode.highlight)}>
                    {mode.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-base sm:text-lg">
                {mode.description}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
