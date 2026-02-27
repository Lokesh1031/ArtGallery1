import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPriceSplit } from '../../utils/currency';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payment_id, amount, cartItems } = location.state || {};

  useEffect(() => {
    // Clear cart from localStorage if you're using it
    // localStorage.removeItem('cart');
  }, []);

  if (!payment_id) {
    navigate('/');
    return null;
  }

  return (
    <div className="payment-result-page success-page">
      <div className="container">
        <motion.div
          className="result-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Animation */}
          <motion.div
            className="success-animation"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="success-title">Payment Successful! 🎉</h1>
            <p className="success-message">
              Your order has been placed successfully. We'll send you a confirmation email shortly.
            </p>

            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Payment ID:</span>
                <span className="value">{payment_id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount Paid:</span>
                <div className="amount-paid">
                  <span className="amount-inr">{formatPriceSplit(amount || 0).inr}</span>
                </div>
              </div>
              <div className="detail-row">
                <span className="label">Items:</span>
                <span className="value">{cartItems?.length || 0} artwork(s)</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value success-badge">✅ Confirmed</span>
              </div>
            </div>

            {/* Order Items */}
            {cartItems && cartItems.length > 0 && (
              <div className="ordered-items">
                <h3>📦 Your Orders</h3>
                <div className="items-list">
                  {cartItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.image_url} 
                        alt={item.artwork_title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=Art';
                        }}
                      />
                      <div className="item-info">
                        <h4>{item.artwork_title}</h4>
                        <p>by {item.artist_name}</p>
                      </div>
                      <div className="item-amount">
                        {formatPriceSplit(parseFloat(item.amount)).inr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="next-steps">
              <h3>What happens next?</h3>
              <div className="steps-list">
                <div className="step-item">
                  <span className="step-number">1</span>
                  <p>You'll receive an order confirmation email</p>
                </div>
                <div className="step-item">
                  <span className="step-number">2</span>
                  <p>Your artwork will be prepared for shipping</p>
                </div>
                <div className="step-item">
                  <span className="step-number">3</span>
                  <p>Track your order in the "My Orders" section</p>
                </div>
                <div className="step-item">
                  <span className="step-number">4</span>
                  <p>Receive your beautiful artwork!</p>
                </div>
              </div>
</div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/profile?tab=orders')}
              >
                📦 View My Orders
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/gallery')}
              >
                🎨 Continue Shopping
              </button>
            </div>

            <div className="support-info">
              <p>
                Need help? Contact us at{' '}
                <a href="mailto:support@artgallery.com">support@artgallery.com</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
