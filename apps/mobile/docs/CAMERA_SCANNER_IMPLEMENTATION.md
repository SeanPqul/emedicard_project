# Camera QR Scanner Implementation Guide

## Overview
This document explains the implementation of the real camera QR scanner using `expo-camera` to replace the simulated scanner.

## Status: ✅ COMPLETED

The QRCodeScanner component has been fully updated with:
- ✅ Camera permission handling with loading and denied states
- ✅ Real barcode scanning handler (`handleBarCodeScanned`) with 2-second debouncing
- ✅ Torch/flash toggle functionality
- ✅ Real `CameraView` integrated as scanner background
- ✅ Permission UI for denied/loading states
- ✅ "Simulate Scan" button removed
- ✅ TypeScript compilation verified

## QR Code Format

Based on `backend/convex/orientations/testScan.ts`:
```
Format: EMC-ORIENTATION-{applicationId}
Example: EMC-ORIENTATION-k97xrxh7wv9t9y8r7c6b5a4f3e2d1
```

## Backend Integration

The scanner uses these Convex mutations:
- `api.orientations.attendance.checkIn` - First scan checks in the user
- `api.orientations.attendance.checkOut` - Second scan checks out the user

The backend automatically determines whether to check-in or check-out based on current state.

## Implementation Details

### ✅ ALL COMPLETED:
1. Imported `expo-camera` modules (`CameraView`, `Camera`, `BarcodeScanningResult`)
2. Added camera permission request on component mount
3. Added `hasPermission` state management with proper UI states
4. Implemented `handleBarCodeScanned` to process real QR codes with debouncing
5. Added torch/flash toggle state (`torchOn`)
6. Added scan debouncing (2-second delay between scans)
7. Integrated real `CameraView` as scanner background (replaces mock UI)
8. Added permission denied UI with proper messaging
9. Added permission loading UI
10. Removed "Simulate Scan" button
11. Fixed all TypeScript errors

### 🎯 READY FOR DEVICE TESTING:

The implementation is complete! The scanner now:
- Uses real `CameraView` from `expo-camera`
- Handles permissions properly (loading, denied, granted states)
- Scans QR codes in real-time with 2-second debouncing
- Provides torch/flash toggle functionality
- Shows appropriate UI for each permission state

## Testing the Scanner

1. **Start the app**: `npm start`
2. **Sign in as inspector** role
3. **Navigate to Scanner** tab (center elevated button)
4. **Grant camera permission** when prompted
5. **Generate a test QR code** with format: `EMC-ORIENTATION-{applicationId}`
6. **Scan the QR** - should trigger check-in
7. **Scan again** - should trigger check-out

## Backend Test Scripts

Use these for testing without the camera:

```bash
# From backend directory
npx convex run orientations/testScan:simulateCheckIn --applicationId "your-app-id"
npx convex run orientations/testScan:simulateCheckOut --applicationId "your-app-id"
npx convex run orientations/testScan:resetOrientation --applicationId "your-app-id"
```

## Known Issues & Solutions

### Issue: Camera not opening
**Solution**: 
1. Check permissions in device settings
2. Rebuild app: `npm run android` or `npm run ios`
3. Ensure `expo-camera` v17 is installed

### Issue: QR not scanning
**Solution**:
1. Ensure QR format is correct: `EMC-ORIENTATION-{applicationId}`
2. Check lighting - QR codes need good lighting
3. Hold camera steady and center the QR in the frame

## Dependencies

Already installed (verified in package.json):
- ✅ `expo-camera`: ~17.0.8
- ✅ Camera permissions configured in app.json

## Architecture

```
OrientationAttendanceScreen (Inspector Screen)
    ↓
QRCodeScanner (Camera Component)
    ↓ Scans QR
handleBarCodeScanned
    ↓ Extracts applicationId
Backend Mutations (checkIn/checkOut)
    ↓ Updates database
Notification sent to user
```

## Next Steps

1. ✅ ~~Complete implementation~~ - DONE!
2. 📱 Test on real device (camera doesn't work in emulator)
3. 🔳 Generate actual QR codes for testing with format: `EMC-ORIENTATION-{applicationId}`
4. ✔️ Verify check-in/check-out flow end-to-end
5. 🔦 Test torch/flash functionality on physical device
6. ♿ Test accessibility features with screen readers

## References

- Expo Camera Docs: https://docs.expo.dev/versions/latest/sdk/camera/
- Backend Test Scripts: `/backend/convex/orientations/testScan.ts`
- Orientation Attendance: `/backend/convex/orientations/attendance.ts`
