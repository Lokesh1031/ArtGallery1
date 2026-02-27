import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createPaymentOrder, initiateRazorpayPayment } from '../../services/payment';
import { formatPriceSplit } from '../../utils/currency';
import { motion } from 'framer-motion';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cartItems = location.state?.cartItems || [];

  const [step, setStep] = useState(1); // 1: Shipping, 2: Review & Payment
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [processing, setProcessing] = useState(false);

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.amount), 0);
  };

  const calculateGST = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateDelivery = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 40; // Free delivery above $500
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() + calculateDelivery();
  };

  const handleShippingChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingDetails.phone)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setStep(2);
  };

  const handlePayNow = async () => {
    setProcessing(true);
    
    try {
      const totalAmount = calculateTotal();
      const receipt = `order_${Date.now()}`;
      const notes = {
        customer_name: shippingDetails.fullName,
        customer_email: shippingDetails.email,
        items_count: cartItems.length
      };

      // Create Razorpay order
      const orderData = await createPaymentOrder(totalAmount, receipt, notes);

      // Initiate Razorpay payment
      await initiateRazorpayPayment(
        orderData,
        shippingDetails,
        cartItems,
        // Success callback
        (response) => {
          console.log('Payment successful:', response);
          setProcessing(false);
          navigate('/payment-success', {
            state: {
              payment_id: response.payment_id,
              amount: totalAmount,
              cartItems: cartItems
            }
          });
        },
        // Failure callback
        (error) => {
          console.error('Payment failed:', error);
          setProcessing(false);
          navigate('/payment-failed', {
            state: {
              error: error,
              amount: totalAmount
            }
          });
        }
      );

    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>🛒 Secure Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Shipping Details</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Review & Payment</span>
            </div>
          </div>

          <div className="checkout-content">
            <div className="checkout-main">
              {/* Step 1: Shipping Details */}
              {step === 1 && (
                <motion.div
                  className="checkout-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2>📦 Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingDetails.fullName}
                          onChange={handleShippingChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingDetails.email}
                          onChange={handleShippingChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number * (10 digits)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingDetails.phone}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        pattern="[6-9][0-9]{9}"
                        maxLength="10"
                        required
                      />
                      <small>We'll use this for order updates</small>
                    </div>

                    <div className="form-group">
                      <label>Complete Address *</label>
                      <textarea
                        name="address"
                        value={shippingDetails.address}
                        onChange={handleShippingChange}
                        placeholder="House No., Building Name, Street, Locality"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingDetails.city}
                          onChange={handleShippingChange}
                          placeholder="e.g., Mumbai"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingDetails.state}
                          onChange={handleShippingChange}
                          placeholder="e.g., Maharashtra"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>PIN Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingDetails.zipCode}
                          onChange={handleShippingChange}
                          placeholder="400001"
                          pattern="[0-9]{6}"
                          maxLength="6"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <select
                          name="country"
                          value={shippingDetails.country}
                          onChange={handleShippingChange}
                          required
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Continue to Review →
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Review & Payment */}
              {step === 2 && (
                <motion.div
                  className="checkout-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2>✅ Review Your Order</h2>
                  
                  {/* Shipping Address Review */}
                  <div className="review-section">
                    <h3>📍 Shipping Address</h3>
                    <div className="address-box">
                      <p><strong>{shippingDetails.fullName}</strong></p>
                      <p>{shippingDetails.address}</p>
                      <p>{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.zipCode}</p>
                      <p>{shippingDetails.country}</p>
                      <p>📞 {shippingDetails.phone}</p>
                      <p>✉️ {shippingDetails.email}</p>
                    </div>
                    <button 
                      className="btn btn-link" 
                      onClick={() => setStep(1)}
                    >
                      ✏️ Edit Address
                    </button>
                  </div>

                  {/* Order Items Review */}
                  <div className="review-section">
                    <h3>🎨 Order Items ({cartItems.length})</h3>
                    <div className="review-items">
                      {cartItems.map((item) => (
                        <div key={item.id} className="review-item">
                          <img 
                            src={item.image_url} 
                            alt={item.artwork_title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80x80/667eea/ffffff?text=Art';
                            }}
                          />
                          <div className="review-item-details">
                            <h4>{item.artwork_title}</h4>
                            <p>by {item.artist_name}</p>
                          </div>
                          <div className="review-item-price">
                            <span className="price-usd">{formatPriceSplit(parseFloat(item.amount)).usd}</span>
                            <span className="price-inr">{formatPriceSplit(parseFloat(item.amount)).inr}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  <div className="payment-info-box">
                    <h3>💳 Payment Options</h3>
                    <p>After clicking "Pay Now", you'll be redirected to Razorpay's secure payment gateway where you can choose from:</p>
                    <div className="payment-methods">
                      <div className="payment-method">
                        <span className="method-icon">📱</span>
                        <span>UPI (Google Pay, PhonePe, PayTM)</span>
                      </div>
                      <div className="payment-method">
                        <span className="method-icon">💳</span>
                        <span>Credit/Debit Cards</span>
                      </div>
                      <div className="payment-method">
                        <span className="method-icon">🏦</span>
                        <span>Net Banking</span>
                      </div>
                      <div className="payment-method">
                        <span className="method-icon">👛</span>
                        <span>Wallets</span>
                      </div>
                    </div>
                    <p className="security-note">
                      <span className="lock-icon">🔒</span>
                      Your payment information is secure and encrypted
                    </p>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary btn-pay-now"
                      onClick={handlePayNow}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          💳 Pay Now
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="checkout-sidebar">
              <div className="order-summary">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({cartItems.length})</span>
                  <div className="summary-prices">
                    <span>{formatPriceSplit(calculateSubtotal()).usd}</span>
                    <span className="inr-small">{formatPriceSplit(calculateSubtotal()).inr}</span>
                  </div>
                </div>

                <div className="summary-row">
                  <span>GST (18%)</span>
                  <div className="summary-prices">
                    <span>{formatPriceSplit(calculateGST()).usd}</span>
                    <span className="inr-small">{formatPriceSplit(calculateGST()).inr}</span>
                  </div>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  {calculateDelivery() === 0 ? (
                    <span className="free-badge">FREE</span>
                  ) : (
                    <div className="summary-prices">
                      <span>{formatPriceSplit(calculateDelivery()).usd}</span>
                      <span className="inr-small">{formatPriceSplit(calculateDelivery()).inr}</span>
                    </div>
                  )}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <div className="summary-prices">
                    <span className="total-usd">{formatPriceSplit(calculateTotal()).usd}</span>
                    <span className="total-inr">{formatPriceSplit(calculateTotal()).inr}</span>
                  </div>
                </div>

                {calculateDelivery() === 0 && (
                  <div className="savings-note">
                    🎉 You're saving $40 on delivery!
                  </div>
                )}

                <div className="trust-badges">
                  <div className="badge">🔐 Secure Payment</div>
                  <div className="badge">✅ 100% Authentic</div>
                  <div className="badge">🚚 Fast Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
