import { v } from "convex/values";
import { action } from "../_generated/server";

export const extractDocumentText = action({
  args: {
    fileUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch the document from the Convex storage URL
    const fileResponse = await fetch(args.fileUrl);
    const fileBlob = await fileResponse.blob();

    // Create FormData to send to the Next.js API route
    const formData = new FormData();
    formData.append("file", fileBlob, "document"); // "document" is the filename

    // Call the Next.js API route to proxy to the OCR microservice
    const nextApiResponse = await fetch("http://localhost:3002/api/ocr", {
      method: "POST",
      body: formData,
    });

    if (!nextApiResponse.ok) {
      const errorData = await nextApiResponse.json();
      throw new Error(errorData.error || "Failed to extract text via Next.js API");
    }

    const { text } = await nextApiResponse.json();
    return text;
  },
});
