# ArtGallery Deployment Guide

Complete guide to deploy your ArtGallery application to production.

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - For frontend deployment (free tier)
3. **Render Account** - For backend + database (free tier)
4. **Domain** (optional) - Custom domain for your site

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Push to GitHub

```bash
cd "c:/Users/bitra/OneDrive/APPS/ArtGallery1"
git add .
git commit -m "Prepare for deployment"
git push origin main
```

If you don't have a remote repository yet:
```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/ArtGallery1.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up using GitHub

### 2.2 Create MySQL Database
1. Click **New +** → **MySQL**
2. Settings:
   - **Name:** `artgallery-db`
   - **Database:** `art_gallery_db`
   - **User:** (auto-generated)
   - **Region:** Choose closest to users
   - **Plan:** Free
3. Click **Create Database**
4. **Save the connection details** (you'll need them next)

### 2.3 Deploy Backend Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - **Name:** `artgallery-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=[from Render database internal connection]
   DB_PORT=[from Render database, usually 3306]
   DB_USER=[from Render database]
   DB_PASSWORD=[from Render database]
   DB_NAME=art_gallery_db
   JWT_SECRET=5e4017b6d2c99d9980d29969d071fdc6ecf9d320a5c0363a5ab6fbf2d83addb1641ff0a1f9dd8badd07761c9d39544a51e0079737241b372051612a39b2b1801
   CLIENT_URL=[will add after Vercel deployment]
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_secret_key_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

5. Click **Create Web Service**

6. Wait for deployment to complete. Your backend URL will be something like:
   ```
   https://artgallery-backend.onrender.com
   ```

### 2.4 Initialize Database
Once backend is deployed, use Render Shell:
1. Go to your backend service → **Shell** tab
2. Run:
   ```bash
   node database/init-db.js
   node database/seed-data.js
   ```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up using GitHub

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repository
3. Settings:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://artgallery-backend.onrender.com/api
   ```
   (Replace with your actual Render backend URL from Step 2.3)

5. Click **Deploy**

6. Your frontend will be live at:
   ```
   https://your-project-name.vercel.app
   ```

---

## Step 4: Update CORS and Client URL

### 4.1 Update Backend Environment
Go back to Render → Your backend service → **Environment**:
1. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://your-project-name.vercel.app
   ```
2. Save changes (this will trigger a redeploy)

### 4.2 Verify CORS Configuration
Your backend already has CORS configured in `server/server.js`. It reads from `CLIENT_URL` env variable.

---

## Step 5: File Upload Configuration

### Update Upload Path (if needed)
Since you're using local file uploads (`/uploads`), you have two options:

**Option A: Use Cloud Storage (Recommended)**
- Integrate AWS S3 or Cloudinary for image uploads
- Update `server/middleware/upload.middleware.js`

**Option B: Keep Local Storage**
- Render's free tier doesn't persist uploaded files across deploys
- Upgrade to a paid plan with persistent disk, or use existing uploaded files only

---

## Step 6: Test Your Deployment

1. Open your Vercel URL: `https://your-project-name.vercel.app`
2. Test:
   - Browse gallery
   - User registration/login
   - Place a bid
   - Check "My Bids" page
   - Artist dashboard
   - Admin features

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render MySQL database created
- [ ] Backend deployed on Render with all environment variables
- [ ] Database initialized (init-db.js + seed-data.js)
- [ ] Frontend deployed on Vercel with REACT_APP_API_URL
- [ ] CLIENT_URL updated in Render backend
- [ ] Test login, gallery browsing, bidding
- [ ] File uploads working (or cloud storage configured)

---

## Troubleshooting

**Backend won't start:**
- Check Render logs
- Verify all environment variables are set
- Ensure database connection details are correct

**Frontend can't connect to backend:**
- Check REACT_APP_API_URL is correct
- Verify CORS CLIENT_URL matches your Vercel URL
- Check backend logs for errors

**Database connection fails:**
- Use Render's internal hostname (not external)
- Verify database is in the same region
- Check DB credentials in environment variables

**File uploads not working:**
- Free tier doesn't persist files - use cloud storage (S3/Cloudinary)
- Or upgrade to Render paid plan with persistent disk

---

## Alternative: Manual Deployment Commands

If you prefer using CLI:

### Vercel CLI:
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

### Render Setup via Dashboard:
Render doesn't have a CLI for initial setup - use the web dashboard as described above.

---

## Cost Estimate

- **Vercel Free Tier:** Free (100GB bandwidth/month)
- **Render Free Tier:** Free (750 hours/month, sleeps after 15min inactivity)
- **Render MySQL Free:** Free (1GB storage, expires after 90 days)

For production, consider upgrading to paid tiers for:
- No cold starts (Render paid: $7/month)
- Persistent database (Render MySQL paid: $7/month)
- Better performance and uptime guarantees

---

## Next Steps

To deploy right now, follow these exact steps:

1. **Push to GitHub** (if not done)
2. **Deploy Backend on Render** - Create database first, then web service
3. **Initialize Database** - Run init-db.js and seed-data.js in Render Shell
4. **Deploy Frontend on Vercel** - Set REACT_APP_API_URL to Render backend URL
5. **Update CORS** - Set CLIENT_URL in Render to Vercel frontend URL
6. **Test everything**

Your app will be live!
