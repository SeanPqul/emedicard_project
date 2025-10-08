import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { buildSignedUrl, verifyHmacSignature, isExpired } from "./hmacUtils";

// Token expiry time in milliseconds (5 minutes)
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 5 minutes

// Generate a signed URL for secure document access using HMAC
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

    // Get signing secret from environment
    const signingSecret = process.env.DOCUMENT_SIGNING_SECRET;
    if (!signingSecret) {
      throw new Error("Document signing secret not configured");
    }

    // Calculate expiration time
    const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
    
    // Generate HMAC-signed URL
    const baseUrl = process.env.CONVEX_URL || '';
    const signedUrl = await buildSignedUrl(
      `${baseUrl}/secure-document`,
      args.documentId,
      expiresAt,
      user._id,
      signingSecret
    );

    return {
      url: signedUrl,
      expiresAt: expiresAt,
    };
  },
});

// Note: Signature verification is handled in the HTTP endpoint
// This function is kept for backward compatibility but is not actively used

// Note: getDocumentInternal is not actively used
// Document access is handled through getDocumentWithoutAuth and authorization in HTTP endpoint

// Get document without authentication (for HMAC verification in HTTP endpoint)
export const getDocumentWithoutAuth = query({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    // Return document data needed for serving the file
    return {
      storageFileId: document.storageFileId,
      originalFileName: document.originalFileName,
      applicationId: document.applicationId,
    };
  },
});

// Get all users who have access to a document (for HMAC verification)
export const getUsersWithDocumentAccess = query({
  args: {
    documentId: v.id("documentUploads"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return [];
    }

    const application = await ctx.db.get(document.applicationId);
    if (!application) {
      return [];
    }

    // Get all users who can access this document
    const authorizedUsers: string[] = [];
    
    // Add the application owner
    authorizedUsers.push(application.userId);
    
    // Add all admin and inspector users
    const adminUsers = await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("role"), "admin"),
          q.eq(q.field("role"), "inspector")
        )
      )
      .collect();
    
    adminUsers.forEach(user => authorizedUsers.push(user._id));

    return authorizedUsers;
  },
});

// Get secure document URL for viewing (replaces direct storage URL)
// This is an alias for generateDocumentToken for backward compatibility
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

    // Get signing secret from environment
    const signingSecret = process.env.DOCUMENT_SIGNING_SECRET;
    if (!signingSecret) {
      throw new Error("Document signing secret not configured");
    }

    // Calculate expiration time
    const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

    // Generate HMAC-signed URL
    const baseUrl = process.env.CONVEX_URL || '';
    const signedUrl = await buildSignedUrl(
      `${baseUrl}/secure-document`,
      args.documentId,
      expiresAt,
      user._id,
      signingSecret
    );

    return {
      url: signedUrl,
      expiresAt: expiresAt,
    };
  },
});
