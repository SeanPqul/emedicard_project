# Secure Document Access Deployment Checklist

## 🚀 Deployment Steps

### 1. Backend Deployment (Convex)

1. **Deploy the backend changes**:
   ```bash
   cd C:\Em\backend
   npx convex deploy
   ```

2. **Set the CONVEX_SITE_URL environment variable**:
   - In your Convex dashboard, go to Settings → Environment Variables
   - Add: `CONVEX_SITE_URL = https://your-deployment.convex.site`
   - Replace with your actual Convex deployment URL

### 2. Mobile App Updates

The mobile app is already updated and ready to use the secure document system. The changes include:
- Updated `ViewDocumentsScreen` to use secure document URLs
- Added loading states while generating secure tokens
- Updated to show security notices to users

### 3. Testing Checklist

- [ ] Test document viewing with valid authentication
- [ ] Test that URLs expire after 15 minutes
- [ ] Test that unauthorized users cannot access documents
- [ ] Test different document types (PDF, images)
- [ ] Test error handling for expired tokens
- [ ] Test loading states in the mobile app

### 4. Monitoring & Maintenance

1. **Set up token cleanup** (optional but recommended):
   - Schedule `cleanupExpiredTokens` to run periodically
   - This can be done using Convex scheduled functions
   - Prevents the token table from growing indefinitely

2. **Monitor usage**:
   - Track token generation frequency
   - Monitor failed access attempts
   - Watch for any security anomalies

### 5. Security Verification

- [ ] Verify old direct URLs no longer work
- [ ] Confirm documents require authentication
- [ ] Test that tokens are single-document specific
- [ ] Verify secure headers prevent caching/embedding

## 📝 Important Notes

1. **Token Expiry**: Currently set to 15 minutes. Adjust `TOKEN_EXPIRY_MS` if needed.

2. **Base URL**: The system uses `process.env.CONVEX_SITE_URL` for generating secure URLs. Make sure this is set correctly in production.

3. **User Roles**: The system allows access for:
   - Document owners (applicants viewing their own documents)
   - Admins
   - Inspectors

4. **Backward Compatibility**: The old query (`getDocumentUploadsRequirementsQuery`) is marked as deprecated but still functional.

## 🔒 Security Features Implemented

✅ Time-limited access tokens (15 minutes)
✅ User authentication required
✅ Document-specific tokens
✅ Secure headers preventing caching
✅ No direct storage URL exposure
✅ Audit trail through token records
✅ Automatic token cleanup available

## 🚨 Post-Deployment Verification

After deployment, verify:
1. Documents load correctly in the mobile app
2. URLs cannot be accessed after expiry
3. Sharing URLs doesn't work without authentication
4. All document types display properly
5. Error messages appear for invalid access attempts
