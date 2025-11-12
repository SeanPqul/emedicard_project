import { NextResponse } from "next/server";

export const maxDuration = 30; // Max duration for Vercel function

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Try external OCR service first if available
    const ocrServiceUrl = process.env.OCR_SERVICE_URL;
    
    if (ocrServiceUrl) {
      try {
        const ocrResponse = await fetch(ocrServiceUrl, {
          method: "POST",
          body: formData,
        });

        if (ocrResponse.ok) {
          const { text } = await ocrResponse.json();
          return NextResponse.json({ text });
        }
      } catch (serviceError) {
        console.log("External OCR service unavailable, falling back to serverless OCR");
      }
    }

    // Fallback to serverless OCR route
    const serverlessOcrUrl = new URL('/api/ocr-serverless', req.url);
    const serverlessResponse = await fetch(serverlessOcrUrl, {
      method: 'POST',
      body: formData,
    });

    if (!serverlessResponse.ok) {
      const errorData = await serverlessResponse.json();
      throw new Error(errorData.error || "OCR processing failed");
    }

    const { text } = await serverlessResponse.json();
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error processing OCR:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
