# 🎨 UPI QR Code Payment System - Complete Setup Guide

## 📋 Overview

This system enables direct artist-to-customer UPI payments via QR code scanning. Customers scan the artist's QR code, pay directly, upload payment proof, and admin verifies the payment.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Initialize Database

```bash
cd server/database
node init-upi-payment-db.js
```

This will create:
- `payment_screenshots` table
- `upi_verification_history` table
- `artist_upi_requests` table
- UPI columns in `users` table
- Orders table updates

### Step 2: Restart Backend Server

```bash
cd server
node server.js
```

The UPI payment routes will be available at `/api/upi-payments/`

### Step 3: Restart Frontend

```bash
cd client
npm start
```

### Step 4: Artist UPI Setup

1. Login as an artist
2. Navigate to `/artist/upi-setup`
3. Enter UPI ID (e.g., `artistname@paytm`)
4. Upload QR code screenshot from PhonePe/Google Pay/Paytm
5. Submit for admin verification

### Step 5: Admin Verification

1. Login as admin
2. Navigate to `/admin/payments`
3. Review artist UPI requests
4. Approve or reject

---

## 🔄 Complete Payment Flow

### 1. Artist Setup (One-time)
```
Artist → UPI Setup Page → Enter UPI ID → Upload QR Code → Submit
                              ↓
Admin Dashboard → Review UPI Request → Approve → Artist Verified ✅
```

### 2. Customer Purchase Flow
```
Customer → Browse Gallery → Add to Cart → Checkout
                              ↓
System → Shows Artist's QR Code + UPI ID → Instructions
                              ↓
Customer → Scans QR → Pays via UPI App → Takes Screenshot
                              ↓
Customer → Uploads Screenshot → Enters Transaction ID → Submit
                              ↓
Order Status → "Payment Under Verification" ⏳
                              ↓
Admin → Reviews Screenshot → Verifies Payment → Approves
                              ↓
Order Status → "Confirmed" ✅
Artist Notified → Customer Notified
```

---

## 📁 Files Created

### Backend Files
```
server/
├── controllers/
│   └── upi-payment.controller.js       ✨ NEW - UPI payment logic
├── routes/
│   └── upi-payment.routes.js           ✨ NEW - UPI payment endpoints
└── database/
    ├── upi-payment-schema.sql          ✨ NEW - Database schema
    └── init-upi-payment-db.js          ✨ NEW - DB initialization
```

### Frontend Files
```
client/src/
├── pages/
│   ├── artist/
│   │   ├── ArtistUpiSetup.js           ✨ NEW - Artist UPI setup page
│   │   └── ArtistUpiSetup.css          ✨ NEW - Styling
│   ├── customer/
│   │   ├── QRPaymentPage.js            ✨ NEW - QR code payment page
│   │   └── QRPaymentPage.css           ✨ NEW - Black 3D card design
│   └── admin/
│       ├── AdminPaymentVerification.js  ✨ NEW - Admin verification dashboard
│       └── AdminPaymentVerification.css ✨ NEW - Dashboard styling
```

---

## 🗄️ Database Schema

### Tables Created

#### 1. **payment_screenshots**
Stores customer payment proof after QR code payment.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| order_id | INT | Order reference |
| user_id | INT | Customer ID |
| artwork_id | INT | Artwork purchased |
| artist_id | INT | Artist receiving payment |
| screenshot_path | VARCHAR | Payment screenshot image |
| transaction_id | VARCHAR | UPI transaction ID |
| payment_amount | DECIMAL | Amount paid |
| upi_id | VARCHAR | Artist's UPI ID used |
| status | ENUM | pending/verified/rejected |
| verified_by | INT | Admin who verified |
| verified_at | TIMESTAMP | Verification time |

#### 2. **artist_upi_requests**
Tracks artist UPI setup requests awaiting admin approval.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| artist_id | INT | Artist submitting request |
| upi_id | VARCHAR | UPI ID submitted |
| upi_qr_code | VARCHAR | QR code image path |
| status | ENUM | pending/approved/rejected |
| reviewed_by | INT | Admin who reviewed |
| review_notes | TEXT | Admin review comments |

#### 3. **upi_verification_history**
Audit trail for all payment verifications.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| payment_screenshot_id | INT | Reference to payment |
| admin_id | INT | Admin performing action |
| action | ENUM | verified/rejected/pending |
| notes | TEXT | Admin notes |

#### 4. **users table** (Updated)
Added UPI fields for artists.

| New Column | Type | Description |
|-----------|------|-------------|
| upi_id | VARCHAR | Artist's UPI ID |
| upi_qr_code | VARCHAR | QR code image path |
| upi_verified | BOOLEAN | Admin verification status |
| upi_approved_by | INT | Admin who approved |
| upi_approved_at | TIMESTAMP | Approval time |

---

## 🎯 API Endpoints

### Artist UPI Management

#### Submit UPI Details
```
POST /api/upi-payments/artist/upi/submit
Headers: Authorization: Bearer {token}
Body: FormData {
  upi_id: string
  qr_code: file
}
```

#### Get Artist UPI Details
```
GET /api/upi-payments/artist/upi/:artistId?
Headers: Authorization: Bearer {token}
```

### Customer Payment Proof

#### Submit Payment Proof
```
POST /api/upi-payments/payment-proof/submit
Headers: Authorization: Bearer {token}
Body: FormData {
  screenshot: file
  transaction_id: string
  order_id: number
  artwork_id: number
  artist_id: number
  payment_amount: number
  upi_id: string
}
```

#### Get Payment History
```
GET /api/upi-payments/my-payments
Headers: Authorization: Bearer {token}
```

### Admin Verification

#### Get Pending UPI Requests
```
GET /api/upi-payments/admin/upi/pending
Headers: Authorization: Bearer {token}
```

#### Verify Artist UPI
```
POST /api/upi-payments/admin/upi/verify
Headers: Authorization: Bearer {token}
Body: {
  request_id: number
  action: "approved" | "rejected"
  notes: string (optional)
}
```

#### Get Pending Payments
```
GET /api/upi-payments/admin/payments/pending
Headers: Authorization: Bearer {token}
```

#### Verify Payment
```
POST /api/upi-payments/admin/payments/verify
Headers: Authorization: Bearer {token}
Body: {
  payment_id: number
  action: "verified" | "rejected"
  notes: string (optional)
}
```

---

## 🎨 UI/UX Features

### Artist UPI Setup Page
- ✨ Gradient background with purple theme
- 📱 QR code preview before submission
- ✅ Real-time status display (Verified/Pending/Not Setup)
- 📝 Step-by-step instructions
- ⏳ Pending request tracking

### QR Payment Page (Black 3D Design)
- 🖤 **Black background** with gradient accents
- 💎 **3D card layout** with depth and shadows
- 🎯 Large centered QR code
- 💰 Dual currency display (USD + INR)
- 👤 Artist avatar and info
- 🖼️ Artwork preview
- 📸 Screenshot upload with preview
- 📋 Copy UPI ID button
- ✅ Payment instructions checklist
- 🔒 Secure and professional appearance

### Admin Verification Dashboard
- 📊 Tab-based navigation (Payments / UPI Requests)
- 🔔 Badge notifications for pending items
- 🎴 Card-based grid layout
- 🔍 Detailed modal views
- ✅/❌ Quick approve/reject actions
- 📝 Notes and reason for rejection
- 📈 Full audit trail

---

## 🔐 Security Features

### Payment Screenshot Verification
- ✅ Admin manual review required
- ✅ Transaction ID validation
- ✅ Amount verification against order
- ✅ Artist UPI ID cross-check
- ✅ Full audit trail maintained

### Artist UPI Verification
- ✅ Admin approval required before activation
- ✅ QR code and UPI ID both reviewed
- ✅ Email and SMS notifications (optional)
- ✅ Cannot receive payments until verified

### Database Security
- ✅ Foreign key constraints
- ✅ Indexed fields for performance
- ✅ Transaction support for data integrity
- ✅ Soft deletes with CASCADE options

---

## 📱 How to Use (User Guide)

### For Artists

#### Setting Up UPI
1. Login to your artist account
2. Click on "UPI Setup" in navigation or go to `/artist/upi-setup`
3. Open your UPI app (PhonePe/Google Pay/Paytm)
4. Go to "My QR Code" or "Receive Money"
5. Take a screenshot of your QR code
6. Return to Art Gallery website
7. Enter your UPI ID (e.g., `yourname@paytm`)
8. Upload the QR code screenshot
9. Click "Submit for Verification"
10. Wait for admin approval (usually 24-48 hours)
11. You'll be notified when approved

### For Customers

#### Making a Payment
1. Browse artworks and add to cart
2. Click "Proceed to Checkout"
3. Review order details
4. Click "Pay Now"
5. You'll see the artist's QR code on a black 3D card
6. Open your UPI app (PhonePe/Google Pay/Paytm)
7. Scan the QR code displayed
8. **IMPORTANT:** Enter the EXACT amount shown
9. Complete the payment in your UPI app
10. Take a screenshot of the success message
11. Return to the payment page
12. Upload the payment screenshot
13. Enter the transaction ID (12-digit UTR number)
14. Click "Submit Payment Proof"
15. Your order status will show "Payment Under Verification"
16. Admin will verify within 24-48 hours
17. You'll be notified when payment is confirmed

### For Admins

#### Verifying UPI Requests
1. Login to admin account
2. Go to `/admin/payments`
3. Click "UPI Requests" tab
4. Review pending requests:
   - Check artist name and email
   - Verify UPI ID format
   - Inspect QR code image
5. Click "Review & Verify"
6. Add notes if needed
7. Click "Approve UPI" or "Reject Request"

#### Verifying Payments
1. Go to `/admin/payments`
2. Click "Payment Verifications" tab
3. Review pending payments:
   - Check customer and artist details
   - Verify transaction ID matches screenshot
   - Confirm amount is correct
   - Cross-check UPI ID
4. Click "View Screenshot & Verify"
5. Examine payment screenshot carefully
6. Add verification notes if needed
7. Click "Verify Payment" or "Reject Payment"
8. Order status will automatically update

---

## 🧪 Testing the System

### Test Scenario 1: Artist UPI Setup
```
1. Create/Login as artist account
2. Navigate to /artist/upi-setup
3. Enter test UPI: testartist@paytm
4. Upload any QR code image (for testing)
5. Submit
6. Login as admin
7. Go to /admin/payments → UPI Requests tab
8. Approve the request
9. Login back as artist
10. Verify UPI status shows "Verified" ✅
```

### Test Scenario 2: Customer Payment
```
1. Login as customer
2. Add artwork to cart
3. Go to checkout
4. Click "Pay Now"
5. QR payment page should display:
   - Artist QR code
   - UPI ID with copy button
   - Amount in USD and INR
   - Upload form
6. Upload test payment screenshot
7. Enter test transaction ID: 123456789012
8. Submit
9. Go to /my-orders
10. Order should show "Payment Pending" status
```

### Test Scenario 3: Admin Verification
```
1. Login as admin
2. Go to /admin/payments
3. Click "Payment Verifications" tab
4. Should see pending payment from Test 2
5. Click "View Screenshot & Verify"
6. Review all details
7. Click "Verify Payment"
8. Order should update to "Confirmed"
```

---

## 🔧 Troubleshooting

### Issue: Database initialization fails
**Solution:**
```sql
-- Check if database exists
SHOW DATABASES;

-- Use the database
USE art_gallery;

-- Check existing tables
SHOW TABLES;

-- If needed, manually run schema
SOURCE server/database/upi-payment-schema.sql;
```

### Issue: QR code image not displaying
**Solution:**
- Check uploads directory permissions
- Verify file path in database starts with `/uploads/`
- Ensure express.static is serving uploads folder
- Check browser console for 404 errors

### Issue: Payment verification not working
**Solution:**
1. Check admin role in database
2. Verify JWT token is valid
3. Check browser console for API errors
4. Verify payment_screenshots table has data

### Issue: Artist can't upload QR code
**Solution:**
- Check multer middleware is configured
- Verify uploads directory exists
- Check file size limits (default 5MB)
- Ensure file type is image/*

---

## 📊 Admin Dashboard Features

### Statistics (Future Enhancement)
```sql
-- Total payments pending
SELECT COUNT(*) FROM payment_screenshots WHERE status = 'pending';

-- Total UPI requests pending
SELECT COUNT(*) FROM artist_upi_requests WHERE status = 'pending';

-- Verified artists
SELECT COUNT(*) FROM users WHERE role = 'artist' AND upi_verified = 1;

-- Total payments verified today
SELECT COUNT(*) FROM payment_screenshots 
WHERE status = 'verified' 
AND DATE(verified_at) = CURDATE();
```

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Database schema initialized
- [ ] All tables created with proper indexes
- [ ] Uploads directory has write permissions
- [ ] Environment variables configured
- [ ] Admin account created and verified
- [ ] Test artist UPI setup flow
- [ ] Test customer payment flow
- [ ] Test admin verification flow
- [ ] Email notifications configured (optional)
- [ ] SMS notifications configured (optional)
- [ ] Backup strategy in place
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured for production
- [ ] HTTPS enabled (required for payment systems)

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Review pending payment verifications
- Approve UPI setup requests
- Monitor failed payments

**Weekly:**
- Check for fraudulent transactions
- Review rejection reasons
- Update transaction ID validation rules

**Monthly:**
- Backup payment_screenshots
- Archive old verified payments
- Review and optimize database indexes

### Contact Information
- **Admin Email:** admin@artgallery.com
- **Support:** support@artgallery.com
- **Technical Issues:** dev@artgallery.com

---

## 🎉 Success!

Your UPI QR Code Payment System is now ready!

**Key Features:**
✅ Direct artist-to-customer payments
✅ QR code scanning support
✅ Manual payment verification
✅ Beautiful black 3D payment UI
✅ Comprehensive admin dashboard
✅ Full audit trail
✅ Secure and transparent

**Start accepting payments in 3 steps:**
1. Artist sets up UPI
2. Admin approves
3. Customers can pay via QR code!

---

## 📄 License & Credits

Built for Art Gallery e-commerce platform
Payment system designed for Indian UPI ecosystem
Supports PhonePe, Google Pay, Paytm, and all UPI apps

---

**Version:** 1.0.0
**Last Updated:** February 2026
**Status:** Production Ready ✅
