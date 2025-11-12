import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const maxDuration = 60; // Increase to 60 seconds for OCR processing

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log("[OCR] Processing file:", file.name, file.type, file.size, "bytes");

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("[OCR] Starting Tesseract with optimized settings...");
    
    // Create a promise that will timeout
    const ocrPromise = Tesseract.recognize(
      buffer,
      'eng',
      {
        // Optimized settings for faster processing
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?\'"()-/',
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    // Timeout after 55 seconds (before Vercel's 60s limit)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OCR timeout - processing took too long')), 55000)
    );

    const result = await Promise.race([ocrPromise, timeoutPromise]) as Tesseract.RecognizeResult;
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[OCR] Completed in ${duration}s. Confidence: ${result.data.confidence.toFixed(2)}%`);
    
    return NextResponse.json({ 
      text: result.data.text || "No text detected",
      confidence: result.data.confidence,
      processingTime: duration
    });
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[OCR] Failed after ${duration}s:`, error.message);
    
    // Return a more helpful error message
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: "OCR processing timeout",
          text: "",
          message: "The image is taking too long to process. Try with a clearer or smaller image."
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "OCR processing failed",
        text: "",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
