export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_PAGES = 20;

function looksLikePdf(bytes: Uint8Array) {
  if (bytes.length < 5) {
    return false;
  }
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

async function extractPdfText(data: Uint8Array) {
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    disableAutoFetch: true,
    disableStream: true,
  });
  const pdf = await loadingTask.promise;
  const pageCount = Math.min(pdf.numPages, MAX_PAGES);
  const parts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let lastY: number | undefined;
    let pageText = "";

    for (const item of content.items) {
      if (!("str" in item) || !item.str) {
        continue;
      }
      const y = item.transform[5];
      if (lastY !== undefined && Math.abs(y - lastY) > 2) {
        pageText += `\n${item.str}`;
      } else {
        pageText += item.str;
      }
      lastY = y;
    }

    parts.push(pageText.trim());
  }

  return parts.filter(Boolean).join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());

    if (name.endsWith(".txt") || file.type.startsWith("text/")) {
      const text = new TextDecoder().decode(bytes).trim();
      if (!text) {
        return NextResponse.json({ error: "This text file is empty." }, { status: 422 });
      }
      return NextResponse.json({ text });
    }

    if (!looksLikePdf(bytes)) {
      return NextResponse.json(
        { error: "This file does not look like a PDF. Upload a .pdf or .txt file." },
        { status: 400 }
      );
    }

    const text = await extractPdfText(bytes);
    if (!text) {
      return NextResponse.json(
        { error: "No readable text was found. This PDF may be a scanned image." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
