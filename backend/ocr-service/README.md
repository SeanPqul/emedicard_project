# OCR Service

Tesseract.js-based OCR microservice for document text extraction.

## Features

- Extract text from images (PNG, JPG, etc.)
- Extract text from PDFs (converts pages to images first)
- RESTful API endpoint
- Runs on port 5001

## Setup

### Install Dependencies
```bash
# From root
pnpm install --filter ocr-service

# Or from ocr-service directory
cd backend/ocr-service
pnpm install
```

### Build
```bash
# From root
pnpm ocr:build

# Or from ocr-service directory
pnpm build
```

## Usage

### Start Service
```bash
# From root
pnpm ocr:start

# Or from ocr-service directory
pnpm start
```

Service will run on `http://localhost:5001`

### API Endpoint

**POST /ocr**

Upload a file for OCR processing.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` field with image or PDF

**Response:**
```json
{
  "text": "Extracted text content..."
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5001/ocr \
  -F "file=@document.png"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileBlob, 'document.pdf');

const response = await fetch('http://localhost:5001/ocr', {
  method: 'POST',
  body: formData,
});

const { text } = await response.json();
```

## Supported File Types

- Images: PNG, JPG, JPEG, BMP, TIFF
- Documents: PDF (multi-page support)

## Language Support

Currently configured for English (`eng`). Additional language data files can be added to support other languages.

## Integration

This service is called by:
- `backend/convex/ocr/extractDocumentText.ts` - Convex action for document processing
- `backend/convex/documents/classifyDocument.ts` - Document classification

## Development

```bash
# Watch mode (auto-rebuild on changes)
pnpm ocr:dev
```

## Troubleshooting

**Service won't start:**
- Check if port 5001 is already in use
- Ensure dependencies are installed
- Verify build completed successfully

**OCR accuracy issues:**
- Increase PDF conversion density (currently 200 DPI)
- Pre-process images (contrast, brightness)
- Ensure document images are clear and well-lit
