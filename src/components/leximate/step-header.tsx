"use client";

import { Check } from "lucide-react";
import { FLOW_STEPS, type FlowStep } from "./types";
import { cn } from "@/lib/utils";

type StepHeaderProps = {
  currentStep: FlowStep;
  wordsPracticed: number;
  sessionGoal: number;
  onSelectStep: (step: FlowStep) => void;
};

export function LexiMateStepHeader({
  currentStep,
  wordsPracticed,
  sessionGoal,
  onSelectStep,
}: StepHeaderProps) {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex w-full items-center gap-3">
      <nav
        aria-label="LexiMate steps"
        className="min-w-0 flex-1"
      >
        {/* Compact dots — used when labels would overflow (phones ~375px) */}
        <ol className="flex items-center justify-center gap-2 sm:hidden">
          {FLOW_STEPS.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isDone = index < currentIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.label}${isDone ? ", completed" : ""}${isCurrent ? ", current step" : ""}`}
                  onClick={() => onSelectStep(step.id)}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center justify-center rounded-md border-2 transition-all",
                    "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                    "hover:bg-accent",
                    isCurrent && "bg-orange-200 border-[#020402]",
                    isDone && "bg-green-200 border-[#020402]",
                    !isCurrent && !isDone && "bg-[#FFFAEF] border-border"
                  )}
                >
                  {isDone ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        isCurrent ? "bg-[#020402]" : "bg-muted-foreground"
                      )}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Full labels — tablet and desktop */}
        <ol className="hidden sm:flex flex-wrap items-center justify-center gap-2">
          {FLOW_STEPS.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isDone = index < currentIndex;
            return (
              <li key={step.id} className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.label}${isDone ? ", completed" : ""}${isCurrent ? ", current step" : ""}`}
                  onClick={() => onSelectStep(step.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                    "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                    "hover:bg-accent",
                    isCurrent && "bg-orange-200 border-[#020402]",
                    isDone && "bg-green-200 border-[#020402]",
                    !isCurrent && !isDone && "bg-[#FFFAEF] border-border"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md text-xs",
                      isCurrent && "bg-yellow-200",
                      isDone && "bg-green-200",
                      !isCurrent && !isDone && "bg-secondary"
                    )}
                  >
                    {isDone ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        className="flex min-h-11 shrink-0 items-center rounded-md border-2 bg-[#FFFAEF] px-3 text-sm font-medium text-[#020402]"
        aria-label={`${wordsPracticed} of ${sessionGoal} words practiced this session`}
      >
        <span className="tabular-nums">
          {wordsPracticed}/{sessionGoal}
        </span>
      </div>
    </div>
  );
}
