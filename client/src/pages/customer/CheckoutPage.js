import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateOrderStatus } from '../../services/api';
import axios from 'axios';
import { motion } from 'framer-motion';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cartItems = location.state?.cartItems || [];

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit-card' // credit-card, debit-card, upi, net-banking
  });

  const [billingDetails, setPayillingDetails] = useState({
    sameAsShipping: true,
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [processing, setProcessing] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.amount), 0);
  };

  const handleShippingChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // Update all cart items with shipping and payment details
      const shippingAddress = `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}, ${shippingDetails.country}`;
      
      for (const item of cartItems) {
        // Update order with actual shipping and payment info
        await axios.put(`/api/orders/${item.id}`, {
          shipping_address: shippingAddress,
          payment_method: paymentDetails.paymentMethod,
          notes: `Payment: ${paymentDetails.paymentMethod}, Phone: ${shippingDetails.phone}`,
          status: 'confirmed',
          payment_status: 'completed'
        });
      }

      alert('Order placed successfully!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
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
          <h1>Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Shipping</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Review</span>
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
                  <h2>Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingDetails.fullName}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingDetails.email}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingDetails.phone}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingDetails.address}
                        onChange={handleShippingChange}
                        placeholder="Street address"
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
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingDetails.zipCode}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={shippingDetails.country}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment Details */}
              {step === 2 && (
                <motion.div
                  className="checkout-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2>Payment Information</h2>
                  
                  <div className="payment-methods">
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentDetails.paymentMethod === 'credit-card'}
                        onChange={handlePaymentChange}
                      />
                      <span>Credit Card</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit-card"
                        checked={paymentDetails.paymentMethod === 'debit-card'}
                        onChange={handlePaymentChange}
                      />
                      <span>Debit Card</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentDetails.paymentMethod === 'upi'}
                        onChange={handlePaymentChange}
                      />
                      <span>UPI</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="net-banking"
                        checked={paymentDetails.paymentMethod === 'net-banking'}
                        onChange={handlePaymentChange}
                      />
                      <span>Net Banking</span>
                    </label>
                  </div>

                  <form onSubmit={handlePaymentSubmit}>
                    {(paymentDetails.paymentMethod === 'credit-card' || paymentDetails.paymentMethod === 'debit-card') && (
                      <>
                        <div className="form-group">
                          <label>Card Number *</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentDetails.cardNumber}
                            onChange={handlePaymentChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Cardholder Name *</label>
                          <input
                            type="text"
                            name="cardHolderName"
                            value={paymentDetails.cardHolderName}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Expiry Date *</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={paymentDetails.expiryDate}
                              onChange={handlePaymentChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV *</label>
                            <input
                              type="text"
                              name="cvv"
                              value={paymentDetails.cvv}
                              onChange={handlePaymentChange}
                              placeholder="123"
                              maxLength="3"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentDetails.paymentMethod === 'upi' && (
                      <div className="form-group">
                        <label>UPI ID *</label>
                        <input
                          type="text"
                          name="upiId"
                          placeholder="yourname@upi"
                          required
                        />
                      </div>
                    )}

                    {paymentDetails.paymentMethod === 'net-banking' && (
                      <div className="form-group">
                        <label>Select Bank *</label>
                        <select name="bank" required>
                          <option value="">Choose your bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                        Back
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Review Order
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <motion.div
                  className="checkout-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2>Review Your Order</h2>

                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p>{shippingDetails.fullName}</p>
                    <p>{shippingDetails.address}</p>
                    <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
                    <p>{shippingDetails.country}</p>
                    <p>Phone: {shippingDetails.phone}</p>
                    <button className="btn-link" onClick={() => setStep(1)}>Edit</button>
                  </div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p>{paymentDetails.paymentMethod.replace('-', ' ').toUpperCase()}</p>
                    {paymentDetails.cardNumber && (
                      <p>**** **** **** {paymentDetails.cardNumber.slice(-4)}</p>
                    )}
                    <button className="btn-link" onClick={() => setStep(2)}>Edit</button>
                  </div>

                  <div className="review-section">
                    <h3>Order Items</h3>
                    {cartItems.map(item => (
                      <div key={item.id} className="review-item">
                        <img 
                          src={item.image_url} 
                          alt={item.artwork_title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=No+Image';
                          }}
                          loading="lazy"
                        />
                        <div>
                          <p><strong>{item.artwork_title}</strong></p>
                          <p>By {item.artist_name}</p>
                        </div>
                        <span className="price">${parseFloat(item.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePlaceOrder}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="checkout-sidebar">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="summary-item">
                      <span>{item.artwork_title}</span>
                      <span>${parseFloat(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="secure-checkout">
                <p>🔒 Secure Checkout</p>
                <p>Your information is protected</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
