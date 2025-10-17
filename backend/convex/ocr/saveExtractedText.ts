import { v } from "convex/values";
import { mutation } from "../_generated/server";

export default mutation({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    extractedText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ocr_results", {
      fileName: args.fileName,
      fileType: args.fileType,
      extractedText: args.extractedText,
      createdAt: new Date().toISOString(),
    });
  },
});
