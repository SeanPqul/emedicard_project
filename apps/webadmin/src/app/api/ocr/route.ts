import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const maxDuration = 30; // Max duration for Vercel function

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log("Processing OCR for file:", file.name, file.type, file.size);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Starting Tesseract OCR...");
    
    // Perform OCR using Tesseract.js
    const result = await Tesseract.recognize(
      buffer,
      'eng',
      {
        logger: m => console.log("Tesseract:", m)
      }
    );
    
    console.log("OCR completed. Confidence:", result.data.confidence);
    
    return NextResponse.json({ 
      text: result.data.text,
      confidence: result.data.confidence 
    });
  } catch (error: any) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { 
        error: "OCR processing failed",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
