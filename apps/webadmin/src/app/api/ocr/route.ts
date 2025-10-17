import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const ocrServiceUrl = process.env.OCR_SERVICE_URL || "http://localhost:5001/ocr";
    const ocrResponse = await fetch(ocrServiceUrl, {
      method: "POST",
      body: formData,
    });

    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json();
      throw new Error(errorData.error || "OCR service failed");
    }

    const { text } = await ocrResponse.json();
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error proxying to OCR service:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
