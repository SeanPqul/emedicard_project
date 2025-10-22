import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

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

app.post("/ocr", upload.single("file"), async (req: Request, res: Response) => {
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
        pages.map((p) => {
          if (!p.path) {
            throw new Error("PDF page path is undefined.");
          }
          return Tesseract.recognize(p.path, "eng");
        })
      );
      text = results.map((r) => r.data.text).join("\n\n--- Page Break ---\n\n");
    } else {
      const result = await Tesseract.recognize(filePath, "eng");
      text = result.data.text;
    }

    // Clean the extracted text
    const cleanedText = cleanOCRText(text);

    fs.unlinkSync(filePath);
    return res.json({ text: cleanedText });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OCR processing failed" });
  }
});

app.listen(5001, () => console.log("✅ OCR service running on port 5001"));
