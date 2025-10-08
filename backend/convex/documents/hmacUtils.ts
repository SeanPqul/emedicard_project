/**
 * Generate HMAC signature for document access URL using Web Crypto API
 * @param documentId - The document ID
 * @param expiresAt - Expiration timestamp in milliseconds
 * @param userId - The user ID requesting access
 * @param secret - The signing secret
 * @returns Base64 URL-encoded signature
 */
export async function generateHmacSignature(
  documentId: string,
  expiresAt: number,
  userId: string,
  secret: string
): Promise<string> {
  const payload = `${documentId}.${expiresAt}.${userId}`;
  
  // Convert strings to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  // Import the secret key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Generate HMAC signature
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convert to base64url format (URL-safe base64)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Verify HMAC signature for document access URL
 * @param signature - The signature to verify
 * @param documentId - The document ID
 * @param expiresAt - Expiration timestamp in milliseconds
 * @param userId - The user ID requesting access (optional for verification)
 * @param secret - The signing secret
 * @returns True if signature is valid, false otherwise
 */
export async function verifyHmacSignature(
  signature: string,
  documentId: string,
  expiresAt: number,
  userId: string | null,
  secret: string
): Promise<boolean> {
  // If userId is provided, include it in verification
  if (userId) {
    const expectedSignature = await generateHmacSignature(documentId, expiresAt, userId, secret);
    return timingSafeEqual(signature, expectedSignature);
  }
  
  // If no userId, we need to verify without it (not recommended)
  return false;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Parse and validate signed URL parameters
 * @param url - The URL to parse
 * @returns Parsed parameters or null if invalid
 */
export function parseSignedUrl(url: string): {
  documentId: string;
  expiresAt: number;
  signature: string;
  userId?: string;
} | null {
  try {
    const urlObj = new URL(url);
    const documentId = urlObj.searchParams.get('documentId');
    const expiresAt = urlObj.searchParams.get('expiresAt');
    const signature = urlObj.searchParams.get('signature');
    const userId = urlObj.searchParams.get('userId');
    
    if (!documentId || !expiresAt || !signature) {
      return null;
    }
    
    const expiresAtNum = parseInt(expiresAt, 10);
    if (isNaN(expiresAtNum)) {
      return null;
    }
    
    return {
      documentId,
      expiresAt: expiresAtNum,
      signature,
      userId: userId || undefined,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Build a signed URL for secure document access
 * @param baseUrl - The base URL for the document endpoint
 * @param documentId - The document ID
 * @param expiresAt - Expiration timestamp in milliseconds
 * @param userId - The user ID requesting access
 * @param secret - The signing secret
 * @returns Complete signed URL
 */
export async function buildSignedUrl(
  baseUrl: string,
  documentId: string,
  expiresAt: number,
  userId: string,
  secret: string
): Promise<string> {
  const signature = await generateHmacSignature(documentId, expiresAt, userId, secret);
  
  const url = new URL(baseUrl);
  url.searchParams.set('documentId', documentId);
  url.searchParams.set('expiresAt', expiresAt.toString());
  url.searchParams.set('signature', signature);
  
  return url.toString();
}

/**
 * Check if a URL has expired
 * @param expiresAt - Expiration timestamp in milliseconds
 * @returns True if expired, false otherwise
 */
export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
