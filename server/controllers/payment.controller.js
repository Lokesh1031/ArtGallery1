// Razorpay Payment Controller
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/database');

// Initialize Razorpay instance (conditional)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.warn('⚠️  Razorpay keys not configured. Payment features will be disabled.');
}

// Create Order (Step 1: Before payment)
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact administrator.'
      });
    }

    const { amount, currency, receipt, notes } = req.body;

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    // Store order in database
    const [result] = await pool.query(`
      INSERT INTO payment_orders 
      (razorpay_order_id, user_id, amount, currency, receipt, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'created', NOW())
    `, [order.id, req.user.id, amount, order.currency, order.receipt]);

    res.status(200).json({
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify Payment (Step 2: After payment)
exports.verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact administrator.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_items,
      shipping_details
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified - update database
      
      // Update payment order status
      await pool.query(`
        UPDATE payment_orders 
        SET razorpay_payment_id = ?,
            razorpay_signature = ?,
            status = 'completed',
            updated_at = NOW()
        WHERE razorpay_order_id = ?
      `, [razorpay_payment_id, razorpay_signature, razorpay_order_id]);

      // Update all cart items (orders) with payment details
      const shippingAddress = `${shipping_details.address}, ${shipping_details.city}, ${shipping_details.state} ${shipping_details.zipCode}, ${shipping_details.country}`;
      
      for (const itemId of order_items) {
        await pool.query(`
          UPDATE orders 
          SET shipping_address = ?,
              status = 'confirmed',
              payment_status = 'completed',
              payment_id = ?,
              notes = CONCAT(COALESCE(notes, ''), ' | Payment ID: ', ?),
              updated_at = NOW()
          WHERE id = ?
        `, [shippingAddress, razorpay_payment_id, razorpay_payment_id, itemId]);
      }

      // Create payment record
      await pool.query(`
        INSERT INTO payments 
        (user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, 
         amount, status, payment_method, created_at)
        SELECT user_id, razorpay_order_id, ?, ?, amount, 'success', 'razorpay', NOW()
        FROM payment_orders
        WHERE razorpay_order_id = ?
      `, [razorpay_payment_id, razorpay_signature, razorpay_order_id]);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      // Signature verification failed
      await pool.query(`
        UPDATE payment_orders 
        SET status = 'failed',
            updated_at = NOW()
        WHERE razorpay_order_id = ?
      `, [razorpay_order_id]);

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await razorpay.payments.fetch(payment_id);

    res.status(200).json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Get All Payments for User
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const [payments] = await pool.query(`
      SELECT p.*, po.amount, po.currency, po.receipt
      FROM payments p
      JOIN payment_orders po ON p.razorpay_order_id = po.razorpay_order_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Refund Payment
exports.refundPayment = async (req, res) => {
  try {
    const { payment_id, amount, reason } = req.body;

    // Create refund
    const refund = await razorpay.payments.refund(payment_id, {
      amount: amount ? Math.round(amount * 100) : undefined, // amount in paise (optional for full refund)
      notes: {
        reason: reason || 'Customer requested refund'
      }
    });

    // Update database
    await pool.query(`
      INSERT INTO refunds 
      (payment_id, razorpay_refund_id, amount, status, reason, created_at)
      VALUES (?, ?, ?, 'processed', ?, NOW())
    `, [payment_id, refund.id, refund.amount / 100, reason]);

    // Update payment status
    await pool.query(`
      UPDATE payments 
      SET status = 'refunded',
          updated_at = NOW()
      WHERE razorpay_payment_id = ?
    `, [payment_id]);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: refund
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Webhook handler for Razorpay events
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature === expectedSignature) {
      const event = req.body.event;
      const payloadData = req.body.payload.payment.entity;

      console.log('Webhook event:', event);

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          // Payment was successful
          console.log('Payment captured:', payloadData.id);
          break;
        
        case 'payment.failed':
          // Payment failed
          await pool.query(`
            UPDATE payments 
            SET status = 'failed',
                updated_at = NOW()
            WHERE razorpay_payment_id = ?
          `, [payloadData.id]);
          break;
        
        case 'refund.created':
          // Refund was created
          console.log('Refund created:', payloadData.id);
          break;
        
        default:
          console.log('Unhandled webhook event:', event);
      }

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

module.exports = exports;
