import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPriceSplit } from '../../utils/currency';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, amount } = location.state || {};

  return (
    <div className="payment-result-page failed-page">
      <div className="container">
        <motion.div
          className="result-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Error Animation */}
          <motion.div
            className="error-animation"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="error-icon">
              <div className="error-x">
                <span className="x-line x-left"></span>
                <span className="x-line x-right"></span>
                <div className="error-circle"></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="error-title">Payment Failed ❌</h1>
            <p className="error-message">
              {error || 'We couldn\'t process your payment. Please try again.'}
            </p>

            {amount && (
              <div className="failed-amount">
                <p>Transaction Amount:</p>
                <div className="amount-display">
                  <span className="amount-inr">{formatPriceSplit(amount).inr}</span>
                </div>
              </div>
            )}

            <div className="failure-reasons">
              <h3>Common reasons for payment failure:</h3>
              <ul>
                <li>❌ Insufficient balance in account</li>
                <li>❌ Incorrect payment details entered</li>
                <li>❌ Payment gateway timeout</li>
                <li>❌ Bank server issues</li>
                <li>❌ Card daily limit exceeded</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>What you can do:</h3>
              <div className="help-options">
                <div className="help-option">
                  <span className="option-icon">🔄</span>
                  <div>
                    <h4>Try Again</h4>
                    <p>Retry payment with the same or different method</p>
                  </div>
                </div>
                <div className="help-option">
                  <span className="option-icon">💳</span>
                  <div>
                    <h4>Change Payment Method</h4>
                    <p>Try UPI, card, or net banking</p>
                  </div>
                </div>
                <div className="help-option">
                  <span className="option-icon">📞</span>
                  <div>
                    <h4>Contact Support</h4>
                    <p>We're here to help resolve any issues</p>
                  </div>
                </div>
                <div className="help-option">
                  <span className="option-icon">🏦</span>
                  <div>
                    <h4>Check with Bank</h4>
                    <p>Verify if amount was deducted from your account</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="important-note">
              <strong>⚠️ Important:</strong> If the amount was deducted from your account but the order failed, 
              it will be refunded within 5-7 business days. Contact support if you need assistance.
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/cart')}
              >
                🔄 Retry Payment
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
                <strong>Need help?</strong> Contact us at{' '}
                <a href="mailto:support@artgallery.com">support@artgallery.com</a>
                {' '}or call <a href="tel:+911234567890">+91 123-456-7890</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailed;
