# 🚀 eMediCard WebAdmin - Vercel Deployment Guide

## Prerequisites
- Vercel account (free tier works)
- Git repository (GitHub/GitLab/Bitbucket)
- pnpm installed locally
- Convex backend already deployed

## 📋 Step-by-Step Deployment

### 1. Prepare Your Codebase
```bash
# Make sure you're in the project root
cd emedicard_project

# Install dependencies
pnpm install

# Test the build locally
pnpm run build --filter=webadmin
```

### 2. Deploy Convex Backend (if not already deployed)
```bash
# Navigate to backend
cd backend

# Deploy Convex
npx convex deploy

# Note down your Convex deployment URL
```

### 3. Install Vercel CLI
```bash
npm install -g vercel
```

### 4. Configure Environment Variables

Create a file with your actual environment variables:
```bash
# Copy the example file
cp apps/webadmin/.env.vercel.example apps/webadmin/.env.production

# Edit with your actual values
# DO NOT commit this file!
```

Your `.env.production` should contain:
```env
NEXT_PUBLIC_CONVEX_URL=https://tangible-pika-290.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvZm91bmQtZ2F0b3ItOTQuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_XTKDseFAVmlrf6X4gRB0VKNLg5h7BNSwfFunEC2SeN
CLERK_WEBHOOK_SECRET=whsec_Iwj/ljvNczyYfmxB190E0gTrklqDflw7
CLERK_JWT_ISSUER_DOMAIN=https://profound-gator-94.clerk.accounts.dev
```

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# Navigate to webadmin folder
cd apps/webadmin

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? emedicard-webadmin
# - In which directory is your code? ./
# - Want to override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production
vercel env add CLERK_JWT_ISSUER_DOMAIN production

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `apps/webadmin`
   - Build Command: Override with `cd ../.. && pnpm install --frozen-lockfile && pnpm run build --filter=webadmin`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`
5. Add Environment Variables in the dashboard
6. Click "Deploy"

### 6. Configure Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com

# Or use the provided domain
# your-project.vercel.app
```

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf apps/webadmin/.next
rm -rf node_modules
pnpm install --frozen-lockfile
pnpm run build --filter=webadmin
```

### Environment Variables Not Working
- Ensure all variables are added in Vercel dashboard
- Check that variable names match exactly
- Redeploy after adding/changing variables

### Monorepo Issues
The `vercel.json` file is configured to handle the monorepo structure. If you encounter issues:
1. Ensure `buildCommand` includes navigation to root: `cd ../.. && pnpm install --frozen-lockfile && pnpm run build --filter=webadmin`
2. Check that all workspace dependencies are properly resolved

### Convex Connection Issues
- Verify your Convex deployment URL is correct
- Check that Clerk configuration matches between Convex and Next.js
- Ensure webhooks are properly configured in Clerk dashboard

## 🛡️ Security Notes
- NEVER commit `.env.local` or `.env.production` files
- Use Vercel's environment variable system for sensitive data
- Keep your Clerk secret keys secure
- Regularly rotate your webhook secrets

## 📊 Monitoring
- Check Vercel dashboard for build logs
- Monitor function execution times
- Set up alerts for failed deployments

## 🔄 Continuous Deployment
Once connected to Git:
- Push to main branch triggers production deployment
- Push to other branches creates preview deployments
- Use pull requests for staging environments

## 📝 Important Files
- `vercel.json` - Vercel configuration
- `next.config.ts` - Next.js configuration
- `.env.vercel.example` - Environment variables template
- `package.json` - Build scripts and dependencies

## ⚠️ DO NOT MODIFY
- Mobile app files (outside of webadmin folder)
- Backend Convex functions (unless coordinated with mobile team)
- Shared packages without testing impact on mobile

## 🆘 Support
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Convex Documentation: https://docs.convex.dev

---
Last Updated: November 2024