const express = require('express');
const router = express.Router();
const upiPaymentController = require('../controllers/upi-payment.controller');
const { verifyToken, isArtist, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Artist UPI Management Routes

// Submit UPI details for verification (Artist only)
router.post('/artist/upi/submit', 
    verifyToken, 
    isArtist, 
    upload.single('qr_code'),
    upiPaymentController.submitUpiDetails
);

// Get artist's UPI details
router.get('/artist/upi/:artistId?', 
    verifyToken,
    upiPaymentController.getArtistUpiDetails
);

// Admin: Get all pending UPI verification requests
router.get('/admin/upi/pending', 
    verifyToken, 
    isAdmin,
    upiPaymentController.getPendingUpiRequests
);

// Admin: Approve/Reject artist UPI details
router.post('/admin/upi/verify', 
    verifyToken, 
    isAdmin,
    upiPaymentController.verifyArtistUpi
);

// Customer Payment Proof Routes

// Submit payment proof after QR code payment
router.post('/payment-proof/submit', 
    verifyToken,
    upload.single('screenshot'),
    upiPaymentController.submitPaymentProof
);

// Get specific payment proof details
router.get('/payment-proof/:payment_id', 
    verifyToken,
    upiPaymentController.getPaymentProof
);

// Get user's own payment history
router.get('/my-payments', 
    verifyToken,
    upiPaymentController.getMyPayments
);

// Admin Payment Verification Routes

// Get all pending payment verifications
router.get('/admin/payments/pending', 
    verifyToken, 
    isAdmin,
    upiPaymentController.getPendingPayments
);

// Verify or reject payment
router.post('/admin/payments/verify', 
    verifyToken, 
    isAdmin,
    upiPaymentController.verifyPayment
);

// Get verification history for a payment
router.get('/admin/payments/history/:payment_id', 
    verifyToken, 
    isAdmin,
    upiPaymentController.getVerificationHistory
);

module.exports = router;
