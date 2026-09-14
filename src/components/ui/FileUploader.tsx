"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FileUploaderProps = {
  onFileRead?: (content: string | ArrayBuffer | null, file: File) => void;
};

export default function FileUploader({ onFileRead }: FileUploaderProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError("");
  };

  const handleProcess = async () => {
    if (!selectedFile || busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      let text = "";
      const name = selectedFile.name.toLowerCase();

      if (name.endsWith(".txt") || selectedFile.type.startsWith("text/")) {
        text = (await selectedFile.text()).trim();
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const response = await fetch("/api/parse", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.text) {
          throw new Error(data.error || "Failed to parse PDF");
        }
        text = String(data.text).trim();
      }

      if (!text) {
        throw new Error("No readable text was found in that file.");
      }

      sessionStorage.setItem("pdfText", text);
      onFileRead?.(text, selectedFile);
      router.push("/refined");
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError(err instanceof Error ? err.message : "Could not read that file.");
      setBusy(false);
    }
  };

  return (
    <div className="grid w-full max-w-xl items-center gap-4">
      <Input
        id="file"
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleFileChange}
        className="font-semibold min-h-11"
      />
      <Button
        type="button"
        onClick={handleProcess}
        disabled={!selectedFile || busy}
        className="min-h-11"
      >
        {busy ? "Reading file…" : "Let's Go!"}
      </Button>
      {error ? (
        <p className="text-sm font-medium text-[#020402]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
