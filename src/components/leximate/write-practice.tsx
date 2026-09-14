"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LexiMateMode } from "@/components/leximate/types";

type Assessment =
  | { kind: "success"; message: string }
  | { kind: "reversal"; message: string }
  | { kind: "pattern"; message: string }
  | { kind: "retry"; message: string }
  | { kind: "self-report"; message: string };

type TesseractGlobal = {
  createWorker: (language?: string) => Promise<{
    recognize: (image: string | HTMLCanvasElement) => Promise<{ data: { text: string } }>;
    terminate: () => Promise<void>;
  }>;
};

declare global {
  interface Window {
    Tesseract?: TesseractGlobal;
  }
}

const TESSERACT_SRC = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length];
}

function reversalMatch(text: string, target: string) {
  const pairs: Record<string, string> = { b: "d", d: "b", p: "q", q: "p" };
  const swapped = [...text].map((letter) => pairs[letter] ?? letter).join("");
  return swapped === target || levenshtein(swapped, target) <= 1;
}

function patternMessage(text: string, target: string) {
  if (text.length < target.length && target.startsWith(text)) {
    return "Nice try! A letter may be missing. Look at the full spelling and try again.";
  }
  if (text.length < target.length) {
    return "Nice try! Some letters may be missing. Check the spelling one letter at a time.";
  }
  if (text.length === target.length && text !== target) {
    const sameLetters = [...text].sort().join("") === [...target].sort().join("");
    if (sameLetters) {
      return "Nice try! The letters may be out of order. Check their sequence from left to right.";
    }
  }
  return "Nice try! Compare each letter with the word above and check its order.";
}

async function loadTesseract() {
  if (typeof window === "undefined") throw new Error("OCR is only available in the browser.");
  if (window.Tesseract) return window.Tesseract;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-tesseract]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load OCR.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = TESSERACT_SRC;
    script.async = true;
    script.dataset.tesseract = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load OCR."));
    document.head.appendChild(script);
  });

  if (!window.Tesseract) throw new Error("OCR library did not load.");
  return window.Tesseract;
}

type WritePracticeProps = {
  mode: LexiMateMode;
  word: string;
  onSuccess: () => void;
  onTrack: () => void;
};

export function WritePractice({ mode, word, onSuccess, onTrack }: WritePracticeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [drawingImage, setDrawingImage] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [inputLabel, setInputLabel] = useState("Mouse drawing");

  const isChild = mode === "child";

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cssWidth = canvas.clientWidth || canvas.width;
    const scale = canvas.width / cssWidth;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.font = `${isChild ? 76 : 64}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(2, 4, 2, 0.12)";
    ctx.fillText(word, cssWidth / 2, canvas.clientHeight / 2);
    ctx.restore();
  }, [isChild, word]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(280, Math.floor(rect.width));
      const height = isChild ? 230 : 210;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.height = `${height}px`;
      drawGuide();
    };

    resize();
    resizeObserverRef.current = new ResizeObserver(resize);
    resizeObserverRef.current.observe(canvas);
    return () => resizeObserverRef.current?.disconnect();
  }, [drawGuide, isChild]);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        setStrokeWidth(7);
        setInputLabel("Finger drawing");
      } else if (event.pointerType === "pen") {
        setStrokeWidth(4);
        setInputLabel("Pen drawing");
      } else {
        setStrokeWidth(3);
        setInputLabel("Mouse drawing");
      }
    };
    window.addEventListener("pointerdown", handlePointer, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointer);
  }, []);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    canvasRef.current?.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPointRef.current) return;
    const point = pointFromEvent(event);
    const scale = canvas.width / (canvas.clientWidth || canvas.width);
    ctx.strokeStyle = "#020402";
    ctx.lineWidth = strokeWidth * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    setAssessment(null);
    setDrawingImage(null);
    drawGuide();
  };

  const submit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    setDrawingImage(image);
    setAssessment(null);
    setIsChecking(true);

    try {
      const tesseract = await loadTesseract();
      const worker = await tesseract.createWorker("eng");
      try {
        const result = await worker.recognize(image);
        const extracted = normalize(result.data.text);
        const target = normalize(word);

        if (extracted === target) {
          setAssessment({ kind: "success", message: "Great writing! Your spelling matches." });
          onSuccess();
        } else if (extracted && reversalMatch(extracted, target)) {
          const changedLetter = target.split("").find((letter, index) => {
            const typed = extracted[index];
            return (letter === "b" && typed === "d") || (letter === "d" && typed === "b") || (letter === "p" && typed === "q") || (letter === "q" && typed === "p");
          });
          setAssessment({
            kind: "reversal",
            message: changedLetter
              ? `Nice try! Check the letter ${changedLetter} — it might be facing the wrong way.`
              : "Nice try! One of the letters might be facing the wrong way. Check b/d or p/q carefully.",
          });
        } else if (extracted && levenshtein(extracted, target) <= 2) {
          setAssessment({ kind: "pattern", message: patternMessage(extracted, target) });
        } else {
          setAssessment({ kind: "retry", message: "I could not confidently read your writing yet." });
        }
      } finally {
        await worker.terminate();
      }
    } catch {
      setAssessment({ kind: "retry", message: "I could not read the drawing this time." });
    } finally {
      setIsChecking(false);
    }
  };

  const selfReport = (confirmed: boolean) => {
    if (confirmed) {
      setAssessment({ kind: "self-report", message: "Great! You checked your spelling and marked it as correct." });
      onSuccess();
    } else {
      setAssessment({ kind: "retry", message: "That is okay. Compare the letters with the word above and try again." });
    }
  };

  return (
    <Card className="border-2 bg-[#FFFAEF] text-[#020402]">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Try writing it</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="text-center">
          <p className={cn("mx-auto inline-flex rounded-md bg-orange-200 px-4 py-3 font-bold", isChild ? "text-5xl" : "text-4xl")}>
            {word}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Trace the light outline, or write the word yourself.</p>
        </div>

        <div className="overflow-hidden rounded-xl border-2 bg-[#fffdf8]">
          <canvas
            ref={canvasRef}
            aria-label={`Drawing area for writing the word ${word}`}
            className="block h-[210px] w-full touch-none cursor-crosshair sm:h-[230px]"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{inputLabel} · Stroke {strokeWidth}px</span>
          <span>Draw with your finger or mouse.</span>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={clearCanvas} disabled={isChecking}>
            Clear
          </Button>
          <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={submit} disabled={isChecking}>
            {isChecking ? "Checking your writing…" : "Submit"}
          </Button>
        </div>

        <div aria-live="polite" role="status" className="min-h-12">
          {isChecking && <p className="text-center text-lg">Checking your writing...</p>}
          {!isChecking && assessment && (
            <div className="flex flex-col gap-4 rounded-xl border-2 bg-yellow-200/40 p-4">
              <p className="text-center text-lg font-semibold">{assessment.message}</p>
              {assessment.kind === "success" || assessment.kind === "self-report" ? (
                <Button type="button" className="mx-auto min-h-11 w-fit" onClick={onTrack}>
                  See my progress
                </Button>
              ) : assessment.kind === "retry" ? (
                <>
                  <p className="text-center text-base">Does this look right to you?</p>
                  {drawingImage && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border bg-white p-3 text-center">
                        <p className="mb-2 font-semibold">Your drawing</p>
                        <img src={drawingImage} alt="Your handwritten word" className="mx-auto h-24 w-full object-contain" />
                      </div>
                      <div className="rounded-lg border bg-white p-3 text-center">
                        <p className="mb-2 font-semibold">Correct spelling</p>
                        <p className={cn("flex h-24 items-center justify-center font-bold", isChild ? "text-4xl" : "text-3xl")}>{word}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button type="button" className="min-h-11" onClick={() => selfReport(true)}>Yes, it looks right</Button>
                    <Button type="button" variant="outline" className="min-h-11" onClick={() => selfReport(false)}>No, I’ll try again</Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
