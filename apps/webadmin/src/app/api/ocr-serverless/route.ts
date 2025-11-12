import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const maxDuration = 30; // Set max duration for Vercel function

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Perform OCR using Tesseract.js
    console.log("Starting OCR processing...");
    
    try {
      const result = await Tesseract.recognize(
        buffer,
        'eng',
        {
          logger: m => console.log(m)
        }
      );
      
      console.log("OCR completed successfully");
      
      return NextResponse.json({ 
        text: result.data.text,
        confidence: result.data.confidence 
      });
    } catch (ocrError: any) {
      console.error("Tesseract OCR error:", ocrError);
      
      // Fallback to empty text if OCR fails
      return NextResponse.json({ 
        text: "",
        error: "OCR processing failed",
        details: ocrError.message 
      });
    }
  } catch (error: any) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
