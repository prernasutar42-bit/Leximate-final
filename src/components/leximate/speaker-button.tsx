"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { canSpeak } from "@/components/leximate/speech";

type SpeakerButtonProps = {
  disabled?: boolean;
  speaking: boolean;
  onSpeak: () => void;
  label?: string;
};

export function SpeakerButton({
  disabled,
  speaking,
  onSpeak,
  label = "Pronounce word",
}: SpeakerButtonProps) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(canSpeak());
  }, []);

  const isDisabled = disabled || !supported;

  const button = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("min-h-11 min-w-11 h-11 w-11", speaking && "bg-yellow-200")}
      onClick={onSpeak}
      disabled={isDisabled}
      aria-label={supported ? label : "Speech is not available in this browser"}
      aria-pressed={speaking}
    >
      <Volume2 className={cn(speaking && "animate-pulse")} />
    </Button>
  );

  if (supported) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent>
        Spoken audio is not available in this browser
      </TooltipContent>
    </Tooltip>
  );
}
