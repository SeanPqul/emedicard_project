import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import { fromPath } from "pdf2pic";
import sharp from "sharp";
import Tesseract from "tesseract.js";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

// Preprocess image for better OCR accuracy
const preprocessImage = async (inputPath: string): Promise<string> => {
  const outputPath = `${inputPath}_preprocessed.png`;
  
  try {
    await sharp(inputPath)
      // Convert to grayscale (better for text recognition)
      .grayscale()
      // Normalize contrast
      .normalize()
      // Sharpen text edges
      .sharpen()
      // Ensure good resolution (300 DPI equivalent)
      .resize({ width: 2480, fit: 'inside', withoutEnlargement: true })
      // Save as PNG for best OCR quality
      .toFormat('png')
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.warn('Image preprocessing failed, using original:', error);
    return inputPath; // Fallback to original if preprocessing fails
  }
};

// Helper function to clean extracted text
const cleanOCRText = (text: string): string => {
  return text
    // Remove excessive whitespace and normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Remove common OCR artifacts
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')
    // Fix common character substitutions
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2026/g, '...')
    // Remove isolated special characters that are likely noise
    .replace(/^[^a-zA-Z0-9\s]+$/gm, '')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
};

// Format text for better readability in admin view
const formatForDisplay = (text: string): string => {
  return text
    // Add section breaks for common document headers
    .replace(/(NAME|FULL NAME|PANGALAN):/gi, '\n━━━ $1: ')
    .replace(/(DATE OF BIRTH|BIRTHDAY|KAPANGANAKAN):/gi, '\n━━━ $1: ')
    .replace(/(ADDRESS|TIRAHAN):/gi, '\n━━━ $1: ')
    .replace(/(ID NUMBER|ID NO):/gi, '\n━━━ $1: ')
    .replace(/(FINDINGS?|IMPRESSION|RESULT):/gi, '\n━━━ $1: ')
    // Add extra spacing for readability
    .replace(/\n/g, '\n');
};

app.post("/ocr", upload.single("file"), async (req: Request, res: Response) => {
  let preprocessedPath: string | null = null;
  
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const mime = req.file.mimetype;
    let text = "";

    if (mime === "application/pdf") {
      // Higher density for better PDF quality
      const convert = fromPath(filePath, { density: 300, format: "png", width: 2480, height: 3508 });
      const pages = await convert.bulk(-1);
      const results = await Promise.all(
        pages.map(async (p) => {
          if (!p.path) {
            throw new Error("PDF page path is undefined.");
          }
          // Preprocess each PDF page for better OCR
          const processedPath = await preprocessImage(p.path);
          return Tesseract.recognize(processedPath, "eng");
        })
      );
      text = results.map((r) => r.data.text).join("\n\n━━━━━━━━━━ Page Break ━━━━━━━━━━\n\n");
    } else {
      // Preprocess image for better OCR accuracy
      preprocessedPath = await preprocessImage(filePath);
      
      const result = await Tesseract.recognize(preprocessedPath, "eng");
      text = result.data.text;
    }

    // Clean and format the extracted text
    const cleanedText = cleanOCRText(text);
    const formattedText = formatForDisplay(cleanedText);

    // Cleanup temporary files
    fs.unlinkSync(filePath);
    if (preprocessedPath && fs.existsSync(preprocessedPath)) {
      fs.unlinkSync(preprocessedPath);
    }
    
    return res.json({ 
      text: formattedText,
      rawText: cleanedText, // Include raw text for reference
      characterCount: cleanedText.length,
      success: true
    });
  } catch (err) {
    console.error(err);
    
    // Cleanup on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (preprocessedPath && fs.existsSync(preprocessedPath)) {
      fs.unlinkSync(preprocessedPath);
    }
    
    return res.status(500).json({ error: "OCR processing failed", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.listen(5001, () => console.log("✅ OCR service running on port 5001"));
