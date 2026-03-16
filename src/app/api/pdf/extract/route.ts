import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_EXTRACTED_LENGTH = 50000; // Match repurpose schema limit

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF." },
        { status: 400 }
      );
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF (.pdf)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "PDF must be under 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text: rawText } = await extractText(pdf, { mergePages: true });

    const text = (rawText ?? "").trim();
    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. It may be scanned/image-based." },
        { status: 400 }
      );
    }

    const truncated = text.length > MAX_EXTRACTED_LENGTH
      ? text.slice(0, MAX_EXTRACTED_LENGTH) + "\n\n[Content truncated...]"
      : text;

    return NextResponse.json({ text: truncated });
  } catch (error) {
    console.error("PDF extract error:", error);
    const msg = error instanceof Error ? error.message : "Failed to extract text from PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
