# EAS Build Setup Guide for iOS

## Overview
Your EAS configuration has been updated. Now you need to configure credentials to build your iOS app.

## What Changed
1. **eas.json** - Added iOS-specific configuration including bundle identifier
2. **app.json** - Added iOS bundle identifier

## Setting Up Credentials

### Option 1: Let EAS Manage Your Credentials (Recommended)
This is the easiest method where EAS automatically generates and manages your credentials.

1. **Run the build command locally:**
   ```bash
   npx eas build --platform ios --profile preview
   ```

2. **Follow the prompts:**
   - EAS will detect missing credentials
   - Choose "Yes" when asked to generate new credentials
   - EAS will create:
     - Distribution certificate
     - Provisioning profile
     - Push notification key (if needed)

3. **Credentials are stored securely on EAS servers** and can be used for GitHub builds

### Option 2: Use Existing Apple Developer Credentials
If you already have credentials:

1. **Run:**
   ```bash
   npx eas credentials
   ```

2. **Select your platform** (iOS)

3. **Choose an option:**
   - Upload existing credentials
   - Generate new credentials
   - Configure push notifications

### Option 3: Local Credentials for GitHub Builds
If building from GitHub and want to use local credentials:

1. **Create a `credentials.json` file:**
   ```json
   {
     "ios": {
       "provisioningProfilePath": "ios/certs/profile.mobileprovision",
       "distributionCertificate": {
         "path": "ios/certs/dist-cert.p12",
         "password": "your-certificate-password"
       }
     },
     "android": {
       "keystore": {
         "keystorePath": "android/keystores/release.keystore",
         "keystorePassword": "your-keystore-password",
         "keyAlias": "key-alias",
         "keyPassword": "your-key-password"
       }
     }
   }
   ```

2. **Update eas.json to use local credentials:**
   ```json
   {
     "build": {
       "production": {
         "ios": {
           "credentialsSource": "local"
         }
       }
     }
   }
   ```

3. **⚠️ IMPORTANT:** Do NOT commit `credentials.json` to your repository. Add it to `.gitignore`

## For GitHub Actions/Workflows

### Using EAS-managed credentials (Recommended):
1. Credentials are automatically available when you use `eas build` from GitHub Actions
2. No additional configuration needed if you've set up credentials using Option 1

### Setting up GitHub Secrets:
If you need to store sensitive information:

1. Go to your GitHub repository settings
2. Navigate to **Settings → Secrets and variables → Actions**
3. Add the following secrets:
   - `EXPO_TOKEN` - Your Expo access token (get it from expo.dev)
   - Any other sensitive values

## Before Building

### Update Submit Configuration
In `eas.json`, replace the placeholder values under `submit.production.ios`:
- `appleId`: Your Apple ID email
- `ascAppId`: Your App Store Connect app ID (found in App Store Connect)
- `appleTeamId`: Your Apple Developer Team ID

## Build Commands

### Development Build (Internal Testing):
```bash
npx eas build --platform ios --profile development
```

### Preview Build (TestFlight/Ad-Hoc):
```bash
npx eas build --platform ios --profile preview
```

### Production Build (App Store):
```bash
npx eas build --platform ios --profile production
```

### Build Both Platforms:
```bash
npx eas build --platform all --profile production
```

## Submitting to App Store

After a successful production build:
```bash
npx eas submit --platform ios --profile production
```

Or automatically submit after build:
```bash
npx eas build --platform ios --profile production --auto-submit
```

## Troubleshooting

### "No credentials found"
Run `npx eas build --platform ios --profile development` and let EAS generate credentials

### "Invalid bundle identifier"
Make sure the bundle identifier in `app.json` matches your Apple Developer account

### "Provisioning profile doesn't include signing certificate"
Run `npx eas credentials` and regenerate your provisioning profile

### GitHub Build Fails
1. Ensure credentials are set up on EAS (Option 1)
2. Make sure your GitHub workflow uses `expo/expo-github-action`
3. Verify your Expo project ID is correct in `app.json`

## Next Steps

1. **First, set up credentials locally:**
   ```bash
   npx eas build --platform ios --profile preview
   ```

2. **Once credentials are configured, you can build from GitHub**

3. **Update the submit configuration** with your actual Apple Developer details

## Resources
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Managing Credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [GitHub Actions Integration](https://docs.expo.dev/build/building-on-ci/)
