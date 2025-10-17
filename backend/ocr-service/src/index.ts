import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

app.post("/ocr", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const mime = req.file.mimetype;
    let text = "";

    if (mime === "application/pdf") {
      const convert = fromPath(filePath, { density: 200, format: "png" });
      const pages = await convert.bulk(-1);
      const results = await Promise.all(
        pages.map((p) => {
          if (!p.path) {
            throw new Error("PDF page path is undefined.");
          }
          return Tesseract.recognize(p.path, "eng");
        })
      );
      text = results.map((r) => r.data.text).join("\n");
    } else {
      const result = await Tesseract.recognize(filePath, "eng");
      text = result.data.text;
    }

    fs.unlinkSync(filePath);
    return res.json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OCR processing failed" });
  }
});

app.listen(5001, () => console.log("✅ OCR service running on port 5001"));
