# eMediCard Logo Setup Instructions

## 🎨 Logo Setup

Your webadmin has been configured to use a custom logo image. Follow these steps to complete the setup:

### Step 1: Save Your Logo

1. Save your green medical cross logo image (the one you showed me) as **`emedicard-logo.png`**
2. Place it in the following directory:
   ```
   apps/webadmin/public/images/emedicard-logo.png
   ```

### Step 2: Logo Specifications

For best results, your logo should:
- **Format**: PNG with transparent background (recommended) or JPG
- **Size**: 512x512 pixels or similar square dimensions
- **File name**: `emedicard-logo.png` (exactly as shown)

### Step 3: Verify Integration

The logo will automatically appear in:
- ✅ Main navigation bar (Navbar) - used by Image component
- ✅ Landing page header
- ✅ All admin and system administrator pages

### Alternative Logo Formats

If you want to use a different image format or filename:

1. Change the filename in the code:
   - Edit `apps/webadmin/src/components/shared/Navbar.tsx` (line 28)
   - Edit `apps/webadmin/src/app/page.tsx` (line 178)
   
2. Update the `src` attribute to match your filename:
   ```tsx
   src="/images/your-logo-name.png"
   ```

## ✅ What's Been Updated

### Renamed "Super Admin" to "System Administrator"

All references to "Super Admin" have been changed to "System Administrator" in:
- ✅ Super Admin Dashboard page title and loading messages
- ✅ Dashboard navigation badges
- ✅ Navigation links ("Back to System Administrator")
- ✅ Access denied error messages
- ✅ Notifications page
- ✅ Rejection history page
- ✅ Landing page routing comments

### Updated Logo Usage

The logo is now integrated using:
- Next.js `Image` component in Navbar (optimized)
- Standard `<img>` tag in landing page (works with hero section styling)

## 🚀 Next Steps

1. Save your logo as `emedicard-logo.png` in `apps/webadmin/public/images/`
2. Restart your development server if it's currently running
3. Visit your app to see the new logo and "System Administrator" branding!

## 📝 Notes

- The logo will be cached by Next.js Image component for better performance
- If the logo doesn't appear immediately, try clearing your browser cache or doing a hard refresh (Ctrl+F5 or Cmd+Shift+R)
- The fallback text "eM" has been replaced with your logo image
