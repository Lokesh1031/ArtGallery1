// Payment Routes
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Create Razorpay order (before payment)
router.post('/create-order', verifyToken, paymentController.createOrder);

// Verify payment (after payment)
router.post('/verify', verifyToken, paymentController.verifyPayment);

// Get payment details
router.get('/details/:payment_id', verifyToken, paymentController.getPaymentDetails);

// Get all payments for user
router.get('/user/:userId', verifyToken, paymentController.getUserPayments);

// Refund payment (admin only)
router.post('/refund', verifyToken, paymentController.refundPayment);

// Webhook endpoint (no auth required)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
