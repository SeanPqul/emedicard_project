# ⚡ Quick Start - Deploy OCR to Render.com

## 🚀 5-Minute Setup

### 1. Push to GitHub
```powershell
git add .
git commit -m "Add Render deployment for OCR service"
git push origin main
```

### 2. Deploy on Render
1. Go to https://render.com
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your repo: `emedicard_project`
5. Fill in:
   - **Name:** `emedicard-ocr-service`
   - **Root Directory:** `backend/ocr-service`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Click **"Create Web Service"**
7. Wait ~5 minutes

### 3. Get Your URL
After deployment, copy your URL:
```
https://emedicard-ocr-service.onrender.com
```

### 4. Add to Vercel
1. Go to Vercel project settings
2. Environment Variables
3. Add:
   - **Name:** `OCR_SERVICE_URL`
   - **Value:** `https://emedicard-ocr-service.onrender.com`
4. Redeploy Vercel

### 5. Test!
Go to your webadmin and click "Extract Text" button.

---

## ⚠️ Important Notes

- **First request takes 30-50 seconds** (cold start)
- **After 15 mins idle, service spins down**
- **Set up cron-job.org to keep it warm** (see full guide)

---

📚 **Full Guide:** See `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions.
