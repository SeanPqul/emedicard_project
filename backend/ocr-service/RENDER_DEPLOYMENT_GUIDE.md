# 🚀 OCR Service Deployment Guide - Render.com

**Free tier:** 750 hours/month (24/7 uptime!)  
**Cold start:** ~30-50 seconds after 15 minutes of inactivity  
**Cost:** $0/month

---

## 📋 Prerequisites

1. GitHub account (your code must be pushed to GitHub)
2. Render.com account (free - sign up at https://render.com)

---

## 🎯 Step 1: Prepare Your Code

### A. Commit and Push Changes
```powershell
# From project root
cd C:\Users\My Pc\Downloads\emediCard_Projectssss\Sean_nakokuha_git\emedicard_project

# Add the changes
git add backend/ocr-service/

# Commit
git commit -m "Add Render.com deployment config for OCR service"

# Push to GitHub
git push origin main
```

**✅ Verify:** Check GitHub to ensure `backend/ocr-service/render.yaml` is uploaded.

---

## 🎯 Step 2: Deploy to Render.com

### A. Sign Up / Log In
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign in with GitHub

### B. Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if first time
   - Grant access to your `emedicard_project` repo

### C. Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `emedicard-ocr-service` |
| **Region** | Singapore (or closest to your users) |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend/ocr-service` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | **Free** ⭐ |

### D. Environment Variables
Add these (if needed):
- `NODE_ENV` = `production` (optional, already in render.yaml)

### E. Advanced Settings
- **Health Check Path:** `/health`
- **Auto-Deploy:** ✅ Yes (deploys automatically on git push)

### F. Deploy!
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Watch the build logs

---

## 🎯 Step 3: Get Your Service URL

After deployment succeeds, Render will give you a URL like:
```
https://emedicard-ocr-service.onrender.com
```

**Test it:**
```powershell
# Check health endpoint
curl https://emedicard-ocr-service.onrender.com/health

# Should return:
# {"status":"healthy","uptime":123,"memory":{...}}
```

---

## 🎯 Step 4: Connect Vercel to Render OCR Service

### A. Add Environment Variable to Vercel

1. Go to https://vercel.com/your-username/emedicard-project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `OCR_SERVICE_URL`
   - **Value:** `https://emedicard-ocr-service.onrender.com` (your Render URL)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**

### B. Redeploy Vercel
```powershell
# Trigger redeployment by pushing any change
git commit --allow-empty -m "Trigger Vercel redeploy with OCR_SERVICE_URL"
git push origin main
```

**Or manually:**
1. Go to Vercel dashboard
2. Click **Deployments**
3. Click **...** on latest deployment
4. Click **Redeploy**

---

## 🎯 Step 5: Test OCR Feature

1. Go to your webadmin: https://emedicard-project.vercel.app
2. Navigate to document verification page
3. Click **"Extract Text"** button
4. Upload a test document

**Expected behavior:**
- First request: ~30-50 seconds (cold start)
- Subsequent requests: 20-30 seconds (warm)
- No more 504 timeouts! ✅

---

## ⚙️ Render.com Settings Explained

### Auto-Deploy
✅ **Enabled by default**
- Every `git push` to your branch triggers automatic deployment
- Takes 3-5 minutes to deploy changes

### Health Checks
- Render pings `/health` every 60 seconds
- If it fails 3 times, service is marked as unhealthy
- Auto-restarts if unhealthy

### Free Tier Limitations
- **Spin down after 15 minutes of inactivity**
  - First request after spin down = 30-50 second cold start
  - Service automatically wakes up when request comes in
- **750 hours/month** (enough for 24/7)
- **512 MB RAM** (enough for OCR)
- **HTTP only** (no custom domains on free tier)

---

## 🔥 Handling Cold Starts

### Problem:
After 15 minutes of no requests, Render spins down your service. The next request takes 30-50 seconds to wake it up.

### Solution 1: Keep-Alive Ping (Free)
Add a cron job to ping your service every 10 minutes:

1. Go to https://cron-job.org (free)
2. Create account
3. Add new cron job:
   - **URL:** `https://emedicard-ocr-service.onrender.com/health`
   - **Schedule:** Every 10 minutes
   - **Method:** GET

This keeps your service warm 24/7! 🔥

### Solution 2: Show "Waking up service" Message
```typescript
// In your frontend doc_verif page
const ocrResponse = await fetch("/api/ocr", {
  method: "POST",
  body: formData,
});

if (ocrResponse.status === 503) {
  // Service is waking up
  setError({
    title: "Service Starting",
    message: "OCR service is waking up. This takes ~30 seconds on first use. Please wait..."
  });
  
  // Retry after 30 seconds
  await new Promise(resolve => setTimeout(resolve, 30000));
  // Retry the request...
}
```

---

## 📊 Monitoring Your Service

### View Logs
1. Go to Render dashboard
2. Click on your service
3. Click **Logs** tab
4. See real-time logs

### Check Metrics
1. Click **Metrics** tab
2. See:
   - Request count
   - Response times
   - Memory usage
   - CPU usage

### Set Up Alerts
1. Click **Notifications**
2. Add your email
3. Get notified if service goes down

---

## 🐛 Troubleshooting

### Build Fails
**Error:** `npm install` fails

**Solution:**
```yaml
# Update render.yaml buildCommand to:
buildCommand: npm install --legacy-peer-deps && npm run build
```

### Service Won't Start
**Error:** Port binding fails

**Solution:** Make sure `index.ts` uses `process.env.PORT`:
```typescript
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
```

### OCR Still Times Out
**Check:**
1. Is `OCR_SERVICE_URL` set in Vercel? (Settings → Env Variables)
2. Is the URL correct? (should be `https://your-service.onrender.com`)
3. Is Render service running? (check Render dashboard)
4. Check Render logs for errors

### 503 Service Unavailable
**Cause:** Service is spinning up (cold start)

**Solution:** Wait 30 seconds and retry automatically (see Solution 2 above)

---

## 🔄 Updating Your Service

### To Deploy Changes:
```powershell
# Make changes to backend/ocr-service/src/index.ts
# Commit and push
git add backend/ocr-service/
git commit -m "Update OCR service"
git push origin main

# Render automatically deploys! ✅
```

### Manual Deploy:
1. Go to Render dashboard
2. Click your service
3. Click **Manual Deploy** → **Deploy latest commit**

---

## 💰 Cost Breakdown

### Current Setup (Free Forever!)
- Render Free Tier: **$0/month**
- 750 hours included
- Perfect for development/small production

### If You Need More:
- **Starter Plan:** $7/month
  - No spin down (always on)
  - 0.5 GB RAM
  - Good for low-medium traffic

- **Standard Plan:** $25/month
  - 2 GB RAM
  - Better for high traffic

**For now, stick with FREE!** ✅

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Signed up for Render.com
- [ ] Created web service on Render
- [ ] Configured `backend/ocr-service` as root directory
- [ ] Selected **Free plan**
- [ ] Deployment succeeded (check logs)
- [ ] Got service URL: `https://your-service.onrender.com`
- [ ] Tested health endpoint: `curl https://your-service.onrender.com/health`
- [ ] Added `OCR_SERVICE_URL` to Vercel environment variables
- [ ] Redeployed Vercel
- [ ] Tested OCR extraction in webadmin
- [ ] (Optional) Set up cron-job.org to prevent cold starts

---

## 🎉 Success!

Your OCR service is now:
- ✅ Deployed on Render.com (FREE!)
- ✅ Auto-deploys on git push
- ✅ Has health check monitoring
- ✅ Connected to Vercel webadmin
- ✅ No more 504 timeouts!

**Next time you update OCR code:**
1. Make changes
2. Git push
3. Render auto-deploys
4. Done! 🚀

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check Render logs for errors
- Check Vercel function logs

---

**Pro Tip:** Keep an eye on your Render dashboard for the first week to see usage patterns and cold start frequency. If cold starts are annoying users, set up the cron-job.org keep-alive ping! 🔥
