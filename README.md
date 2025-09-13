# eMediCard Project

A digital health card management system with:  
- 📱 **Mobile App** (React Native + Expo)  
- 🌐 **Web Admin** (Next.js)  
- ⚡ **Backend** (Convex)  

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```
You may also need global tools:
```bash
npm install -g @expo/cli convex
```
### 2. Configure Environment
Copy example env files and update values:
```bash
cp backend/.env.example backend/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/webadmin/.env.example apps/webadmin/.env.local
```

### 3. Start Development
Start everything:
```bash
pnpm run dev
```

Or run individually:
```bash
pnpm run dev --filter=mobile    # npx expo start --dev-client
pnpm run dev --filter=webadmin  # npm run dev
pnpm run dev --filter=backend   # npx convex dev
```

## 🛠️ Useful Commands
```bash
pnpm run build     # build all apps/packages
pnpm run lint      # lint all code
pnpm run typecheck # type check
pnpm run test      # run tests
```
