# OCR Service Rebuild Instructions

## Quick Start

Since PowerShell script execution is disabled, use one of these methods:

### Method 1: Use CMD (Recommended)
```cmd
cd C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\backend\ocr-service
npm run build
```

### Method 2: Use Git Bash
```bash
cd /c/Users/My\ Pc/Downloads/emediCard_Projectssss/Sean_nakokuha_git/emedicard_project/backend/ocr-service
npm run build
```

### Method 3: Run from VS Code Terminal
1. Open VS Code
2. Open integrated terminal (Ctrl + `)
3. Navigate to ocr-service directory
4. Run `npm run build`

---

## What Was Changed

The OCR service now includes:
- **Higher quality PDF processing** (300 DPI instead of 200 DPI)
- **Text cleaning algorithm** to remove OCR artifacts
- **Better character recognition** with enhanced Tesseract config
- **Smart quote normalization** and whitespace cleanup

---

## After Building

1. **Restart the OCR service:**
   ```cmd
   npm start
   ```
   or if using pm2:
   ```cmd
   pm2 restart ocr-service
   ```

2. **Verify it's running:**
   - Service should be available at `http://localhost:5001`
   - You should see: `✅ OCR service running on port 5001`

3. **Test the improvements:**
   - Go to admin dashboard
   - Navigate to any document verification page
   - Click "Extract Text" on a document
   - Verify the text is cleaner and more readable

---

## Troubleshooting

### Build Errors
If you get TypeScript errors, ensure dependencies are installed:
```cmd
npm install
```

### Port Already in Use
If port 5001 is already in use, either:
1. Stop the existing service
2. Or change the port in `src/index.ts` (line 82)

### Tesseract Not Found
Ensure Tesseract is installed:
```cmd
npm list tesseract.js
```

If missing:
```cmd
npm install tesseract.js
```

---

## Rollback (If Needed)

If issues occur, you can revert the changes:
```cmd
git checkout HEAD -- src/index.ts
npm run build
```

---

## Verification

Test with a Philippine government ID or health certificate:
1. Upload the document
2. Click "Extract Text"
3. Verify:
   - ✅ No random characters like `» ¢ | &`
   - ✅ Clean line breaks
   - ✅ Proper spacing between words
   - ✅ Smart quotes converted to regular quotes

---

**Last Updated:** October 21, 2025  
**Version:** 2.0 (Enhanced OCR)
