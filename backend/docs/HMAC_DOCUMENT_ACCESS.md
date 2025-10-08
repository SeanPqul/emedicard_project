# HMAC-Based Secure Document Access

## Overview

This document describes the implementation of HMAC-signed URLs for secure document access, replacing the previous database-based token system. The new system provides stateless, cryptographically secure document access without storing tokens in the database.

## Key Changes

### 1. Environment Configuration
- Added `DOCUMENT_SIGNING_SECRET` environment variable for HMAC signing
- Must be a secure, random string (minimum 32 characters recommended)
- Example: `DOCUMENT_SIGNING_SECRET=45973492ed21efa5cbf4e18e4462b546b49e6bc018f7cae7d7557db5fd73daa1`

### 2. HMAC Utility Functions (`convex/documents/hmacUtils.ts`)
- `generateHmacSignature()`: Creates HMAC-SHA256 signatures using Web Crypto API
- `verifyHmacSignature()`: Validates signatures with timing-safe comparison
- `buildSignedUrl()`: Constructs complete signed URLs with all parameters
- `isExpired()`: Checks if a URL has expired based on timestamp

### 3. Refactored Convex Functions (`convex/documents/secureAccessQueries.ts`)
- `generateDocumentToken()`: Now generates HMAC-signed URLs instead of database tokens
- `getSecureDocumentUrl()`: Alias for backward compatibility
- `getDocumentWithoutAuth()`: Retrieves document metadata for HTTP endpoint
- `getUsersWithDocumentAccess()`: Returns all users authorized to access a document

### 4. Updated HTTP Endpoint (`convex/http.ts`)
- `/secure-document` route now verifies HMAC signatures
- Validates signature against all authorized users
- Checks expiration before serving files
- Maintains all existing security headers

### 5. Database Schema Changes (`convex/schema.ts`)
- Removed `documentAccessTokens` table
- No longer storing access tokens in database
- Cleaner schema with less maintenance overhead

## Security Benefits

### 1. Stateless Authentication
- No database lookups for token validation
- Reduced attack surface (no token storage)
- Better scalability (no database bottleneck)

### 2. Cryptographic Security
- HMAC-SHA256 provides strong signature security
- Signatures are tied to specific documentId, userId, and expiration
- Tampering with any parameter invalidates the signature

### 3. Time-Limited Access
- URLs expire after 15 minutes (configurable)
- Expiration is cryptographically bound to the signature
- Cannot extend expiration without generating new signature

### 4. User-Specific Access
- Each user gets a unique signature
- Signatures cannot be transferred between users
- Full audit trail through user-specific signatures

## URL Format

```
https://your-domain.com/secure-document?documentId=<id>&expiresAt=<timestamp>&signature=<hmac>
```

### Parameters:
- `documentId`: The Convex document ID
- `expiresAt`: Unix timestamp in milliseconds when URL expires
- `signature`: Base64URL-encoded HMAC-SHA256 signature

## Usage Example

### Frontend (React Native)
```typescript
// Request a secure URL for document viewing
const { url, expiresAt } = await convex.mutation(
  api.documents.secureAccessQueries.getSecureDocumentUrl,
  { documentId: document._id }
);

// Open the URL in a browser or webview
await Linking.openURL(url);
```

### Backend Verification Flow
1. Parse URL parameters (documentId, expiresAt, signature)
2. Check if URL has expired
3. Get all authorized users for the document
4. Verify signature against each authorized user
5. If valid, serve the document with security headers

## Migration Notes

### Breaking Changes
- `documentAccessTokens` table no longer exists
- `markTokenAsUsed` mutation removed
- `cleanupExpiredTokens` mutation removed
- `verifyDocumentToken` query deprecated

### Backward Compatibility
- `getSecureDocumentUrl` maintained as alias
- URL structure changed but frontend code remains compatible
- Existing document access patterns preserved

## Testing

Run the test script to verify implementation:
```bash
cd backend
node test-hmac-document-access.js
```

The test script validates:
- Signature generation and verification
- Expiration checking
- Security against tampering
- User-specific signatures

## Security Considerations

### 1. Secret Key Management
- Use a cryptographically secure random secret
- Minimum 32 characters recommended
- Never commit the secret to version control
- Rotate the secret periodically

### 2. HTTPS Required
- Always use HTTPS in production
- Prevents signature interception
- Protects document content in transit

### 3. Expiration Time
- Default: 15 minutes
- Balance security vs user experience
- Consider shorter times for highly sensitive documents
- Adjust `TOKEN_EXPIRY_MS` constant as needed

### 4. Monitoring
- Log failed signature verifications
- Monitor for suspicious access patterns
- Track document access frequency

## Performance Impact

### Improvements:
- ✅ No database queries for token validation
- ✅ Faster signature verification (microseconds)
- ✅ No cleanup jobs needed
- ✅ Reduced database storage

### Trade-offs:
- ⚠️ Slightly more CPU for signature generation
- ⚠️ Multiple signature verifications for admin access
- ⚠️ Cannot revoke URLs once generated (until expiry)

## Future Enhancements

1. **Single-Use URLs**: Add nonce parameter for one-time access
2. **IP Restrictions**: Bind signatures to specific IP addresses
3. **Custom Expiration**: Allow per-document expiration times
4. **Audit Logging**: Track all document access attempts
5. **Rate Limiting**: Prevent brute-force signature attacks

## Troubleshooting

### Common Issues:

1. **"Document signing secret not configured"**
   - Add `DOCUMENT_SIGNING_SECRET` to `.env.local`
   - Restart the Convex dev server

2. **"Invalid signature" errors**
   - Verify the secret is the same in all environments
   - Check for URL encoding issues
   - Ensure system clocks are synchronized

3. **"URL has expired" immediately**
   - Check server and client time synchronization
   - Verify timezone settings
   - Consider increasing `TOKEN_EXPIRY_MS`

## References

- [HMAC RFC 2104](https://tools.ietf.org/html/rfc2104)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Timing Attacks](https://en.wikipedia.org/wiki/Timing_attack)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
