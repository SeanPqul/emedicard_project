import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { handleMayaWebhook } from "./payments/maya/webhook";

const http = httpRouter();

// Helper function to generate error HTML
function getErrorHTML(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>eMediCard - Error</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 400px;
        }
        .error-icon {
          font-size: 4rem;
          color: #F44336;
          margin-bottom: 1rem;
        }
        h1 { color: #333; font-size: 1.5rem; margin: 1rem 0; }
        p { color: #666; margin: 1rem 0; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin-top: 1rem;
          background-color: #007AFF;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">⚠️</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="emedicardproject://" class="button">Return to App</a>
      </div>
    </body>
    </html>
  `;
}

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error("CLERK_WEBHOOK_SECRET is not set");
            return new Response("Webhook secret not configured", { status: 500 });
        }

        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Error occurred -- no svix headers", {
                status: 400,
            });
        }
  
        const payload = await request.json();
        const body = JSON.stringify(payload);

        const wh = new Webhook(webhookSecret);
        let evt:any;

        //verify webhook
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp,
            }) as any;
        } catch (err) {
            console.error("Error verifying webhook: ", err)
            return new Response("Error occurred", {status: 400})
        }

        const eventType = evt.type;
        
        if(eventType === "user.created") {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.createUser.createUserMutation, {
                    email,
                    fullname: name,
                    image: image_url,
                    clerkId: id,
                    username: email.split("@") [0],
                })
            } catch (error) {
                console.log("Error creating user:", error);
                return new Response("Error creating user:", { status: 500});
            }
        }

        return new Response("Webhook processed successfully", {status: 200})
    })
})

// Maya Payment Webhook Route
http.route({
    path: "/maya-webhook",
    method: "POST",
    handler: handleMayaWebhook,
});

// Maya Payment Redirect Handler
http.route({
  path: "/payment-redirect",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const paymentId = url.searchParams.get("paymentId");
    const applicationId = url.searchParams.get("applicationId");
    
    console.log("Maya redirect received:", { status, paymentId, applicationId });
    
    // Validate required parameters
    if (!status || !paymentId || !applicationId) {
      console.error("Missing required parameters in payment redirect");
      return new Response(getErrorHTML("Missing required parameters", "Please contact support if this issue persists."), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    
    // Validate status parameter
    if (!['success', 'cancel', 'failure'].includes(status)) {
      console.error("Invalid status parameter:", status);
      return new Response(getErrorHTML("Invalid payment status", "An unexpected status was received."), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    
    // Log redirect attempt for monitoring
    console.log("Payment redirect processing:", {
      status,
      paymentId,
      applicationId,
      timestamp: new Date().toISOString(),
    });
    
    // Handle payment status updates based on redirect status
    let updateError: string | null = null;
    try {
      if (status === "success") {
        // Handle payment success - this will update payment status and application status
        // intelligently based on job category requirements
        await ctx.runMutation(api.payments.handleRedirectSuccess.default, {
          paymentId: paymentId as any,
          applicationId: applicationId as any,
        });
      } else if (status === "cancel") {
        // Update payment status to cancelled
        await ctx.runMutation(api.payments.maya.checkout.cancelMayaCheckout, {
          paymentId: paymentId as any,
        });
      } else if (status === "failure") {
        // Update payment status to failed
        await ctx.runMutation(api.payments.updatePaymentStatus.updatePaymentStatusMutation, {
          paymentId: paymentId as any,
          paymentStatus: "Failed",
        });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      updateError = error instanceof Error ? error.message : "Unknown error";
      // Continue with redirect even if status update fails
    }
    
    // Construct the deep link for the mobile app
    const deepLink = `emedicardproject://payment/${status}?paymentId=${paymentId}&applicationId=${applicationId}`;
    
    // Return HTML that attempts to redirect to the mobile app
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>eMediCard - Payment ${status === 'success' ? 'Successful' : status === 'cancel' ? 'Cancelled' : 'Failed'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .status-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .success { color: #4CAF50; }
          .failure { color: #F44336; }
          .cancel { color: #FF9800; }
          h1 { color: #333; font-size: 1.5rem; margin: 1rem 0; }
          p { color: #666; margin: 1rem 0; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 1rem;
            background-color: #007AFF;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          }
          .button:hover {
            background-color: #0056b3;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007AFF;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status-icon ${status}">
            ${status === 'success' ? '✅' : status === 'cancel' ? '🔙' : '❌'}
          </div>
          <h1>
            Payment ${status === 'success' ? 'Successful' : status === 'cancel' ? 'Cancelled' : 'Failed'}
          </h1>
          <div id="redirecting">
            <p>Redirecting to eMediCard app...</p>
            <div class="spinner"></div>
          </div>
          <div id="manual-redirect" style="display: none;">
            <p>If you're not automatically redirected, click below:</p>
            <a href="${deepLink}" class="button">Continue to App</a>
          </div>
        </div>
        
        <script>
          // Attempt to redirect to the app
          console.log('Attempting to redirect to:', '${deepLink}');
          
          // Try immediate redirect
          window.location.href = '${deepLink}';
          
          // Show manual redirect button after 2 seconds if still on page
          setTimeout(() => {
            document.getElementById('redirecting').style.display = 'none';
            document.getElementById('manual-redirect').style.display = 'block';
          }, 2000);
          
          // For iOS, also try using window.location.replace
          setTimeout(() => {
            window.location.replace('${deepLink}');
          }, 500);
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// Secure Document Access Route with HMAC Verification
http.route({
  path: "/secure-document",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get query parameters
      const url = new URL(request.url);
      const signature = url.searchParams.get("signature");
      const documentId = url.searchParams.get("documentId") as any;
      const expiresAt = url.searchParams.get("expiresAt");
      
      if (!signature || !documentId || !expiresAt) {
        // Log potential malformed request or tampering
        console.warn(`SECURITY: Missing params - sig=${!!signature} doc=${!!documentId} exp=${!!expiresAt}`);
        return new Response("Missing required parameters", { status: 400 });
      }

      // Parse expiration timestamp
      const expiresAtNum = parseInt(expiresAt, 10);
      if (isNaN(expiresAtNum)) {
        // Log potential timestamp tampering
        console.warn(`SECURITY: Invalid timestamp - doc=${documentId} value=${expiresAt}`);
        return new Response("Invalid expiration timestamp", { status: 400 });
      }

      // Check if URL has expired
      if (Date.now() > expiresAtNum) {
        // Log potential replay attack (using expired URL)
        const minutesExpired = Math.round((Date.now() - expiresAtNum) / (60 * 1000));
        console.warn(`SECURITY: Expired URL attempt - doc=${documentId} expired=${minutesExpired}min ago`);
        return new Response("URL has expired", { status: 403 });
      }

      // Get signing secret from environment
      const signingSecret = process.env.DOCUMENT_SIGNING_SECRET;
      if (!signingSecret) {
        console.error("Document signing secret not configured");
        return new Response("Server configuration error", { status: 500 });
      }

      // Get the document first
      const document = await ctx.runQuery(api.documents.secureAccessQueries.getDocumentWithoutAuth, {
        documentId,
      });

      if (!document || !document.storageFileId) {
        return new Response("Document not found", { status: 404 });
      }

      // Get all users who have access to this document
      const authorizedUserIds = await ctx.runQuery(api.documents.secureAccessQueries.getUsersWithDocumentAccess, {
        documentId,
      });

      // Import HMAC verification function dynamically
      const { verifyHmacSignature } = await import('./documents/hmacUtils');

      // Try to verify signature against each authorized user
      let isValidSignature = false;
      let verificationAttempts = 0;
      for (const userId of authorizedUserIds) {
        verificationAttempts++;
        const isValid = await verifyHmacSignature(
          signature,
          documentId,
          expiresAtNum,
          userId,
          signingSecret
        );
        if (isValid) {
          isValidSignature = true;
          break;
        }
      }

      if (!isValidSignature) {
        // Log potential tampering attempt (signature doesn't match any authorized user)
        console.error(`SECURITY: Invalid signature - doc=${documentId} attempts=${verificationAttempts} sig=${signature.substring(0, 8)}...`);
        return new Response("Invalid signature", { status: 403 });
      }

      // Log successful access for audit
      console.log(`Document accessed: doc=${documentId} file=${document.originalFileName}`);

      // Get the file blob from storage
      const blob = await ctx.storage.get(document.storageFileId);
      
      if (!blob) {
        return new Response("File not found", { status: 404 });
      }

      // Determine content type based on file extension
      const fileName = document.originalFileName.toLowerCase();
      let contentType = "application/octet-stream";
      
      if (fileName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileName.endsWith(".png")) {
        contentType = "image/png";
      } else if (fileName.endsWith(".gif")) {
        contentType = "image/gif";
      } else if (fileName.endsWith(".webp")) {
        contentType = "image/webp";
      }

      // Set secure headers with appropriate CSP for different file types
      let csp = "default-src 'none'; ";
      let disposition = "inline";
      
      if (contentType.startsWith("image/")) {
        // For images: allow them to be displayed
        csp = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'";
      } else if (contentType === "application/pdf") {
        // For PDFs: allow PDF rendering with more permissive CSP
        csp = "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; object-src 'self' blob: data:; frame-src 'self' blob: data:; worker-src 'self' blob:";
        // Ensure PDFs are displayed inline
        disposition = "inline";
      }
      
      const headers = new Headers({
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${document.originalFileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN", // Allow embedding in same origin
        "Content-Security-Policy": csp,
      });

      // Return the file with secure headers
      return new Response(blob, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error("Error serving document:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
