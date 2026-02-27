# 🔍 TROUBLESHOOTING GUIDE - Art Gallery

## ✅ Current Status

### Backend Server: RUNNING ✓
- **URL:** http://localhost:5000
- **Status:** Working correctly
- **Artworks:** 66 approved artworks available
- **API Test:** Successful

### Frontend Server: RUNNING ✓
- **URL:** http://localhost:3001
- **Status:** Compiled successfully
- **Gallery:** http://localhost:3001/gallery

---

## 🧪 How to Check if Gallery is Working

### Step 1: Open Gallery Page
1. Open your browser (Chrome, Edge, or Firefox)
2. Go to: **http://localhost:3001/gallery**
3. Wait 2-3 seconds for page to load

### Step 2: Check Browser Console (F12)
1. **Press F12** on your keyboard
2. Click on **"Console"** tab
3. Look for these messages:

**✅ Good Signs:**
```
📡 Fetching artworks with filters: {category: '', minPrice: '', maxPrice: '', search: ''}
✅ Artworks Response: {success: true, count: 66, artworks: Array(66)}
📊 Artworks count: 66
🎨 First 3 artworks: [{…}, {…}, {…}]
```

**❌ Bad Signs (If you see these, tell me):)**
```
❌ Error fetching data: ...
Network Error
CORS Error
Failed to fetch
```

### Step 3: Check Network Tab
1. Press F12 → Click **"Network"** tab
2. Refresh the page (Ctrl+R)
3. Look for a request to: **artworks**
4. Click on it and check:
   - **Status:** Should be `200 OK`
   - **Response:** Should show array of 66 artworks

---

## 🔧 Quick Fixes

### Issue 1: "No artworks found"

**If you see console logs showing 66 artworks but gallery is empty:**

1. Hard refresh the page: **Ctrl+Shift+R**
2. Clear browser cache: **Ctrl+Shift+Delete**
3. Try incognito mode: **Ctrl+Shift+N**

**If console shows 0 artworks:**
- Check for any filters applied (category dropdown, price range)
- Click "Clear Filters" button if visible
- Check console for error messages

### Issue 2: "Failed to load payment details"

This error appears when:
- Artist hasn't set up UPI payment yet
- You're trying to checkout before artist verification

**To fix:**
1. Login as **Artist**
2. Go to **UPI Setup** page
3. Add UPI details and QR code
4. Wait for admin approval

---

## 📊 Test the API Directly

Run this in PowerShell to see raw data:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks" | Select-Object -ExpandProperty artworks | Select-Object id, title, artist_name, price | Format-Table
```

You should see output like:
```
id title                artist_name      price
-- -----                -----------      -----
67 Bird                 user             500.00
37 The Dreamer          James Chen       5200.00
38 Wisdom and Grace     James Chen       4800.00
...
```

---

## 🎨 Sample Artworks in Database

Your gallery currently has:
- **66 artworks** (all approved)
- **6 artists**: Administrator, Emma Johnson, Sophia Martinez, James Chen, Oliver Williams, user
- **16 categories**
- **Images**: Using Unsplash URLs (professional quality)
- **Price range**: ₹500 - ₹5200

---

## 🚀 Next Steps

### 1. Verify Gallery Display
- Open http://localhost:3001/gallery
- You should see a grid of artwork cards with images
- Each card shows: Title, Artist Name, Price, Category

### 2. Test Features
- ✓ Click on an artwork to view details
- ✓ Add to cart
- ✓ Search artworks
- ✓ Filter by category
- ✓ Filter by price range

### 3. Add Your Own Artworks
- Login as Artist
- Go to "Upload Artwork"
- Upload real artwork images
- Set price and details
- Submit for approval

---

## 📝 What to Share if Still Having Issues

If gallery still shows "No artworks found", please share:

1. **Screenshot** of the gallery page
2. **Console log** (F12 → Console tab)
3. **Network tab** showing artworks request
4. **Any error messages** in red

**Quick copy/paste this command to get diagnostic info:**
```powershell
.\test-api.ps1
```

---

## ✅ Servers Are Running Successfully!

- Backend: http://localhost:5000 ✓
- Frontend: http://localhost:3001 ✓  
- Database: Connected ✓
- API: Serving 66 artworks ✓

**Everything is working on the backend side!**

If you see "No artworks found" in the browser, it's likely a frontend display issue. Check the browser console (F12) for errors and share what you see.
