# Test Setup Instructions

## 🚨 PowerShell Script Execution Issue

If you get the error: `running scripts is disabled on this system`, you need to enable script execution.

### Option 1: Run in CMD (Recommended)

Open **Command Prompt** (not PowerShell) and run:

```cmd
cd "C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\apps\webadmin"
npm install
npm test
```

### Option 2: Enable PowerShell Scripts (One-time setup)

Run PowerShell **as Administrator** and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running `npm install` again.

---

## 📦 Step-by-Step Setup

### Step 1: Install Dependencies

```cmd
cd "C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project\apps\webadmin"
npm install
```

This will install all the testing dependencies I added to `package.json`:
- ✅ jest
- ✅ @testing-library/react
- ✅ @testing-library/jest-dom
- ✅ @testing-library/user-event
- ✅ jest-environment-jsdom
- ✅ @types/jest

### Step 2: Run Tests

```cmd
npm test
```

Or for specific tests:

```cmd
npm test -- attendance-tracker
```

### Step 3: Run with Coverage

```cmd
npm run test:coverage
```

---

## 📁 Files I Created/Updated

### ✅ Test Configuration
- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Setup file for React Testing Library
- `package.json` - Updated with test scripts and dependencies

### ✅ Test Files
- `src/app/dashboard/attendance-tracker/__tests__/page.test.tsx` - Main test suite
- `src/app/dashboard/attendance-tracker/__tests__/README.md` - Quick start guide

### ✅ Documentation
- `docs/ATTENDANCE_TRACKER_TESTING_GUIDE.md` - Full testing guide
- `docs/ATTENDANCE_TRACKER_TEST_SUMMARY.md` - Summary for your leader
- `docs/ATTENDANCE_TRACKER_CHECKLIST.md` - Testing checklist

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@testing-library/react'"

**Solution**: Dependencies not installed yet. Run:
```cmd
npm install
```

### Issue: "Jest encountered an unexpected token"

**Solution**: Make sure `jest.config.js` and `jest.setup.js` exist in the webadmin folder.

### Issue: "Tests failed to run"

**Solution**: Check that the test file exists:
```
apps/webadmin/src/app/dashboard/attendance-tracker/__tests__/page.test.tsx
```

### Issue: "Module not found: @/convex/_generated/api"

**Solution**: Run Convex codegen:
```cmd
cd ../../..
npx convex dev
```

---

## ✅ Quick Verification

After setup, verify everything works:

```cmd
# Should show Jest version
npm test -- --version

# Should find your test file
npm test -- --listTests

# Run the actual tests
npm test -- attendance-tracker
```

---

## 🎯 What the Tests Cover

### ✅ Attendance Status Logic
- FINISHED: Both check-in AND check-out filled
- MISSED: No check-in OR no check-out (still visible)
- EXCUSED: Has inspector notes with excuse

### ✅ Timezone Security
- Server-side timestamps only
- Minimum 20-minute duration
- Check-in date validation (PHT)

### ✅ Features
- Session finalization
- Manual status updates
- Search and filtering
- Date selection
- UI display

---

## 📋 Next Steps

1. **Install dependencies** (using CMD or with PowerShell admin rights)
2. **Run tests**: `npm test`
3. **Read the guides** in `docs/` folder
4. **Run manual tests** from the checklist

---

## 💡 Alternative: Test Without Jest

If you can't get Jest working, you can still do **manual testing**:

1. Open `docs/ATTENDANCE_TRACKER_CHECKLIST.md`
2. Follow the manual test scenarios
3. Test in your browser with real data
4. Use Convex Dashboard to verify backend changes

---

## 📞 Need Help?

Check these files:
- Quick Start: `src/app/dashboard/attendance-tracker/__tests__/README.md`
- Full Guide: `docs/ATTENDANCE_TRACKER_TESTING_GUIDE.md`
- Summary: `docs/ATTENDANCE_TRACKER_TEST_SUMMARY.md`

---

**Good luck bro!** 🚀
