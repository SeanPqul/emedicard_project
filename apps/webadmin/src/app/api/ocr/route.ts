import { NextResponse } from "next/server";

// Keep a generous maxDuration, but this route is now just a proxy to the OCR service
export const maxDuration = 60;

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL;

if (!OCR_SERVICE_URL) {
  console.warn("[OCR] OCR_SERVICE_URL is not set. /api/ocr proxy will fail until configured.");
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!OCR_SERVICE_URL) {
      return NextResponse.json(
        {
          error: "OCR service not configured",
          message: "OCR service URL is missing. Please contact the system administrator.",
          text: "",
        },
        { status: 500 }
      );
    }

    console.log("[OCR] Proxying file to OCR service:", file.name, file.type, file.size, "bytes");

    // Convert Next.js File to a Blob so we can send it via fetch/FormData
    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    const ocrFormData = new FormData();
    ocrFormData.append("file", blob, file.name || "document");

    const controller = new AbortController();
    // Client-facing timeout: if OCR service hangs too long, abort and return error
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s client timeout

    let ocrResponse: Response;
    try {
      ocrResponse = await fetch(`${OCR_SERVICE_URL}/ocr`, {
        method: "POST",
        body: ocrFormData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[OCR] OCR service responded in ${duration}s with status ${ocrResponse.status}`);

    const data = await ocrResponse.json().catch(() => ({}));

    if (!ocrResponse.ok) {
      console.error("[OCR] OCR service error:", data);
      return NextResponse.json(
        {
          error: data.error || "OCR service error",
          text: data.text || "",
          details: data.details,
        },
        { status: ocrResponse.status }
      );
    }

    // Normalize response shape a bit for the frontend, but keep all data from OCR service
    return NextResponse.json({
      text: data.text || data.rawText || "No text detected",
      processingTime: duration,
      characterCount: data.characterCount,
      success: data.success,
      rawText: data.rawText,
    });
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[OCR] Proxy failed after ${duration}s:`, error?.message || error);

    if (error?.name === "AbortError") {
      return NextResponse.json(
        {
          error: "OCR timeout",
          text: "",
          message: "The OCR service took too long to respond. Please try again with a clearer or smaller image.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "OCR proxy failed",
        text: "",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
