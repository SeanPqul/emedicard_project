import { ImageAnnotatorClient } from '@google-cloud/vision';
import { v } from "convex/values";
import { action } from "../_generated/server";

let visionClient: ImageAnnotatorClient;

// Helper function to determine document type based on text and labels
function determineDocumentType(text: string | undefined, labels: string[] | undefined): string {
  if (!text && !labels) return "Unknown";

  const lowerText = text?.toLowerCase() || "";
  const lowerLabels = labels?.map(label => label.toLowerCase()) || [];

  // Keywords for common document types
  if (lowerText.includes("driver's license") || lowerText.includes("drivers license") || lowerText.includes("license number")) {
    return "Driver's License";
  }
  if (lowerText.includes("passport") || lowerText.includes("republic of")) {
    return "Passport";
  }
  if (lowerText.includes("birth certificate") || lowerText.includes("certificate of live birth")) {
    return "Birth Certificate";
  }
  if (lowerText.includes("social security") || lowerText.includes("ssn")) {
    return "Social Security Card";
  }
  if (lowerText.includes("utility bill") || lowerText.includes("electricity bill") || lowerText.includes("water bill")) {
    return "Utility Bill";
  }
  if (lowerText.includes("bank statement") || lowerText.includes("account statement")) {
    return "Bank Statement";
  }
  if (lowerText.includes("identification card") || lowerText.includes("id card") || lowerText.includes("identification no")) {
    return "ID Card";
  }

  // Check labels for common document indicators
  if (lowerLabels.some(label => label.includes("identification") || label.includes("document"))) {
    return "Generic ID/Document";
  }

  return "Unknown";
}

// Initialize Google Cloud Vision client
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  // For production on Convex, using base64 encoded credentials
  const credentials = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
  visionClient = new ImageAnnotatorClient({
    credentials: JSON.parse(credentials),
  });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // For local development using GOOGLE_APPLICATION_CREDENTIALS file path
  visionClient = new ImageAnnotatorClient();
} else {
  // Fallback for local development if no credentials are set (might not work)
  console.warn("Google Cloud Vision AI credentials not found. Classification might fail.");
  visionClient = new ImageAnnotatorClient(); // This might fail without credentials
}

export const classify = action({
  args: {
    storageFileId: v.id("_storage"),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.storage.get(args.storageFileId);
    if (!file) {
      throw new Error("File not found in Convex storage.");
    }

    // Read the file content as a Buffer
    const fileBuffer = await file.arrayBuffer();
    const base64EncodedImage = Buffer.from(fileBuffer).toString('base64');

    let classificationResults: any = {};

    try {
      if (args.mimeType.startsWith('image/')) {
        // Perform image analysis using Google Cloud Vision AI
        const [result] = await visionClient.annotateImage({
          image: { content: base64EncodedImage },
          features: [
            { type: 'LABEL_DETECTION' },
            { type: 'TEXT_DETECTION' },
            { type: 'IMAGE_PROPERTIES' }, // For blurriness, etc.
            { type: 'SAFE_SEARCH_DETECTION' },
            { type: 'WEB_DETECTION' },
          ],
        });

        const extractedText = result.fullTextAnnotation?.text;
        const extractedLabels = result.labelAnnotations?.map((label: any) => label.description);
        const documentType = determineDocumentType(extractedText, extractedLabels);

        classificationResults = {
          documentType: documentType,
          labels: extractedLabels,
          text: extractedText,
          isPotentiallyBlurry: false,
          // Add more properties as needed
        };

        // Simple heuristic for blurriness (can be improved)
        if (result.imagePropertiesAnnotation?.dominantColors?.colors && result.imagePropertiesAnnotation.dominantColors.colors.length < 3) {
            classificationResults.isPotentiallyBlurry = true;
        }

      } else if (args.mimeType === 'application/pdf' || args.mimeType.includes('officedocument')) {
        const [result] = await visionClient.documentTextDetection({
          image: { content: base64EncodedImage },
        });
        const extractedText = result.fullTextAnnotation?.text;
        const documentType = determineDocumentType(extractedText, undefined);

        classificationResults = {
          documentType: documentType,
          text: extractedText,
        };
      } else {
        classificationResults = {
          message: "Unsupported file type for detailed classification.",
          mimeType: args.mimeType,
        };
      }
    } catch (error: any) {
      console.error("Error classifying document:", error);
      classificationResults = {
        error: error.message,
        message: "Failed to classify document.",
      };
    }

    return classificationResults;
  },
});
