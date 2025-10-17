"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const pdf2pic_1 = require("pdf2pic");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use((0, cors_1.default)());
app.post("/ocr", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const filePath = req.file.path;
        const mime = req.file.mimetype;
        let text = "";
        if (mime === "application/pdf") {
            const convert = (0, pdf2pic_1.fromPath)(filePath, { density: 200, format: "png" });
            const pages = await convert.bulk(-1);
            const results = await Promise.all(pages.map((p) => tesseract_js_1.default.recognize(p.path, "eng")));
            text = results.map((r) => r.data.text).join("\n");
        }
        else {
            const result = await tesseract_js_1.default.recognize(filePath, "eng");
            text = result.data.text;
        }
        fs_1.default.unlinkSync(filePath);
        return res.json({ text });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "OCR processing failed" });
    }
});
app.listen(5001, () => console.log("✅ OCR service running on port 5001"));
//# sourceMappingURL=index.js.map