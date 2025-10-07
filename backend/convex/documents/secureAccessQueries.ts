import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Token expiry time in milliseconds (15 minutes)
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// Generate a secure access token for a document
export const generateDocumentToken = mutation({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database using clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Get the application
    const application = await ctx.db.get(document.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify user has access to this document
    // Check if user owns the application or is an admin/inspector
    const isOwner = application.userId === user._id;
    const isAdmin = user.role === "admin" || user.role === "inspector";
    
    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized access to document");
    }

    // Generate a secure random token
    const tokenString = generateSecureToken();
    
    // Store token with expiry
    await ctx.db.insert("documentAccessTokens", {
      token: tokenString,
      documentId: args.documentId,
      userId: user._id,
      createdAt: Date.now(),
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      used: false,
    });

    return {
      token: tokenString,
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    };
  },
});

// Verify a document access token
export const verifyDocumentToken = query({
  args: {
    token: v.string(),
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    // Find the token
    const tokenRecord = await ctx.db
      .query("documentAccessTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return { isValid: false, userId: null };
    }

    // Check if token matches the document
    if (tokenRecord.documentId !== args.documentId) {
      return { isValid: false, userId: null };
    }

    // Check if token has expired
    if (tokenRecord.expiresAt < Date.now()) {
      return { isValid: false, userId: null };
    }

    // Token is valid
    return { 
      isValid: true, 
      userId: tokenRecord.userId,
    };
  },
});

// Internal query to get document (for HTTP endpoint)
export const getDocumentInternal = query({
  args: {
    documentId: v.id("documentUploads"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    // Get the application
    const application = await ctx.db.get(document.applicationId);
    if (!application) {
      return null;
    }

    // Verify user has access
    const user = await ctx.db.get(args.userId);
    const isOwner = application.userId === args.userId;
    const isAdmin = user?.role === "admin" || user?.role === "inspector";
    
    if (!isOwner && !isAdmin) {
      return null;
    }

    return document;
  },
});

// Get secure document URL for viewing (replaces direct storage URL)
export const getSecureDocumentUrl = mutation({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database using clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Get the application
    const application = await ctx.db.get(document.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify user has access to this document
    const isOwner = application.userId === user._id;
    const isAdmin = user.role === "admin" || user.role === "inspector";
    
    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized access to document");
    }

    // Check for existing valid token first
    const existingToken = await ctx.db
      .query("documentAccessTokens")
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.eq(q.field("userId"), user._id),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    let tokenString: string;
    let expiresAt: number;

    if (existingToken) {
      // Use existing valid token
      tokenString = existingToken.token;
      expiresAt = existingToken.expiresAt;
      console.log("Reusing existing token for document:", args.documentId);
    } else {
      // Generate a new secure random token
      tokenString = generateSecureToken();
      expiresAt = Date.now() + TOKEN_EXPIRY_MS;
      
      // Store token with expiry
      await ctx.db.insert("documentAccessTokens", {
        token: tokenString,
        documentId: args.documentId,
        userId: user._id,
        createdAt: Date.now(),
        expiresAt: expiresAt,
        used: false,
      });
      console.log("Created new token for document:", args.documentId);
    }
    
    // Get the base URL from environment or use default
    const baseUrl = process.env.CONVEX_URL;
    
    // Construct secure URL
    const secureUrl = `${baseUrl}/secure-document?documentId=${args.documentId}&token=${tokenString}`;
    
    return {
      url: secureUrl,
      expiresAt: expiresAt,
    };
  },
});

// Helper function to generate secure random token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add timestamp for additional uniqueness
  token += Date.now().toString(36);
  
  return token;
}

// Mark a token as used (called when document is accessed)
export const markTokenAsUsed = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the token
    const tokenRecord = await ctx.db
      .query("documentAccessTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!tokenRecord) {
      throw new Error("Token not found");
    }
    
    // Update the token to mark it as used
    await ctx.db.patch(tokenRecord._id, {
      used: true,
    });
    
    return { success: true };
  },
});

// Cleanup expired tokens (run periodically)
export const cleanupExpiredTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired tokens
    const expiredTokens = await ctx.db
      .query("documentAccessTokens")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    // Delete expired tokens
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }
    
    return { deletedCount: expiredTokens.length };
  },
});
