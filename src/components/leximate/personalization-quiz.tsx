"use client";

import { useMemo, useState } from "react";
import { BookOpen, Ear, Puzzle, SpellCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LexiMateMode } from "@/components/leximate/types";

export type PersonalizationAnswers = {
  yesNo: boolean[];
  supportChoices: string[];
};

type SupportChoice = {
  id: string;
  adultLabel: string;
  childLabel: string;
  icon: typeof Volume2;
};

const SUPPORT_CHOICES: SupportChoice[] = [
  { id: "pronunciation", adultLabel: "Hearing words read aloud", childLabel: "Hearing words", icon: Volume2 },
  { id: "word-breakdown", adultLabel: "Breaking words into parts", childLabel: "Breaking words apart", icon: Puzzle },
  { id: "spelling", adultLabel: "Spelling practice", childLabel: "Practicing spelling", icon: SpellCheck },
  { id: "comprehension", adultLabel: "Understanding longer text", childLabel: "Understanding stories", icon: BookOpen },
];

const QUESTIONS: Record<LexiMateMode, { prompt: string; kind: "yes-no" | "multi"; icon?: typeof Volume2 }[]> = {
  adult: [
    { prompt: "Do you find long words difficult to read?", kind: "yes-no" },
    { prompt: "Do you read slowly?", kind: "yes-no" },
    { prompt: "Do you lose your place while reading?", kind: "yes-no" },
    { prompt: "Do you understand words better when you hear them?", kind: "yes-no" },
    { prompt: "Do you need help breaking words into smaller parts?", kind: "yes-no" },
    { prompt: "Do you make spelling mistakes often?", kind: "yes-no" },
    { prompt: "Do you find long paragraphs difficult to understand?", kind: "yes-no" },
    { prompt: "Which support would help you most?", kind: "multi" },
  ],
  child: [
    { prompt: "Are big words hard to read?", kind: "yes-no", icon: BookOpen },
    { prompt: "Do you read slowly, like taking your time?", kind: "yes-no", icon: BookOpen },
    { prompt: "Do you lose your place in a story?", kind: "yes-no", icon: BookOpen },
    { prompt: "Do you like hearing words read to you?", kind: "yes-no", icon: Ear },
    { prompt: "Do you need help breaking words into smaller parts?", kind: "yes-no", icon: Puzzle },
    { prompt: "Do you forget spellings?", kind: "yes-no", icon: SpellCheck },
    { prompt: "Do long stories feel hard to follow?", kind: "yes-no", icon: BookOpen },
    { prompt: "What would help you most?", kind: "multi", icon: Ear },
  ],
};

const EMPTY_ANSWERS: PersonalizationAnswers = { yesNo: [], supportChoices: [] };

type PersonalizationQuizProps = {
  mode: LexiMateMode;
  onComplete: (answers: PersonalizationAnswers) => void;
};

export function PersonalizationQuiz({ mode, onComplete }: PersonalizationQuizProps) {
  const questions = QUESTIONS[mode];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalizationAnswers>(EMPTY_ANSWERS);

  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;
  const currentYesNo = answers.yesNo[questionIndex];
  const selectedSupport = answers.supportChoices;
  const isAnswerable = question.kind === "yes-no" ? typeof currentYesNo === "boolean" : selectedSupport.length > 0;
  const Icon = question.icon;

  const progressLabel = useMemo(
    () => `${questionIndex + 1} of ${questions.length} questions`,
    [questionIndex, questions.length]
  );

  function chooseYesNo(value: boolean) {
    setAnswers((previous) => {
      const yesNo = [...previous.yesNo];
      yesNo[questionIndex] = value;
      return { ...previous, yesNo };
    });
  }

  function toggleSupport(id: string) {
    setAnswers((previous) => ({
      ...previous,
      supportChoices: previous.supportChoices.includes(id)
        ? previous.supportChoices.filter((choice) => choice !== id)
        : [...previous.supportChoices, id],
    }));
  }

  function next() {
    if (!isAnswerable) return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    setQuestionIndex((index) => index + 1);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Let&apos;s personalize your support</h2>
        <p className="mt-2 text-lg text-[#020402]">
          One quick question at a time. There are no right or wrong answers.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-label={progressLabel}>
        {questions.map((item, index) => (
          <span
            key={`${item.prompt}-${index}`}
            aria-hidden="true"
            className={cn(
              "size-2.5 rounded-full border border-[#020402]",
              index === questionIndex && "scale-125 bg-orange-200",
              index < questionIndex && "bg-green-200",
              index > questionIndex && "bg-[#FFFAEF]"
            )}
          />
        ))}
      </div>

      <Card className="w-full max-w-2xl border-2 bg-[#FFFAEF] text-[#020402]">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-md bg-yellow-200 px-3 py-1 text-sm font-semibold">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">{questions.length - questionIndex - 1} remaining</span>
          </div>
          {Icon && (
            <div className="flex size-12 items-center justify-center rounded-full bg-yellow-200" aria-hidden="true">
              <Icon className="size-6" />
            </div>
          )}
          <CardTitle className={cn("text-2xl leading-snug sm:text-3xl", mode === "child" && "sm:text-4xl")}>
            {question.prompt}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {question.kind === "yes-no" ? (
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Choose yes or no">
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  aria-pressed={currentYesNo === value}
                  onClick={() => chooseYesNo(value)}
                  className={cn(
                    "min-h-12 rounded-xl border-2 px-4 py-3 text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    mode === "child" && "min-h-14 text-xl",
                    currentYesNo === value ? "border-[#020402] bg-orange-200" : "border-border bg-background hover:bg-accent"
                  )}
                >
                  {value ? "Yes" : "No"}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-3" role="group" aria-label="Choose one or more supports">
              {SUPPORT_CHOICES.map((choice) => {
                const selected = selectedSupport.includes(choice.id);
                const ChoiceIcon = choice.icon;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSupport(choice.id)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      mode === "child" && "min-h-14 text-lg",
                      selected ? "border-[#020402] bg-orange-200" : "border-border bg-background hover:bg-accent"
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-yellow-200" aria-hidden="true">
                      <ChoiceIcon className="size-5" />
                    </span>
                    <span>{mode === "child" ? choice.childLabel : choice.adultLabel}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="button" className="min-h-11 px-6" disabled={!isAnswerable} onClick={next}>
            {isLast ? "Finish quiz" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
