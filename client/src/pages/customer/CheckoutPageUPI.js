import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getArtistUpiDetails, submitPaymentProof } from '../../services/upi-payment';
import axios from 'axios';
import './CheckoutPage.css';

const CheckoutPageUPI = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cartItems = location.state?.cartItems || [];

  const [step, setStep] = useState(1); // 1: Review Order, 2: Artist QR Code, 3: Upload Proof
  const [artistUpiDetails, setArtistUpiDetails] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.amount), 0);
  };

  // Get the artist's UPI details for the payment
  const loadArtistUpi = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      const artistId = cartItems[0].artist_id; // Assuming all items are from same artist
      const data = await getArtistUpiDetails(artistId);
      setArtistUpiDetails(data.artist);
      if (!data.artist.upi_verified) {
        alert('Artist has not set up UPI payment yet. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading artist UPI:', error);
      alert('Failed to load payment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPayment = async () => {
    if (!shippingDetails.address || !shippingDetails.phone) {
      alert('Please fill in all shipping details');
      return;
    }
    await loadArtistUpi();
    setStep(2);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setPaymentScreenshot(file);
    }
  };

  const handlePaymentProofSubmit = async () => {
    if (!paymentScreenshot) {
      alert('Please upload payment screenshot');
      return;
    }

    if (!transactionId.trim()) {
      alert('Please enter transaction ID');
      return;
    }

    setProcessing(true);
    try {
      const shippingAddress = `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}, ${shippingDetails.country}`;
      
      // Create order first
      const orderPromises = cartItems.map(item =>
        axios.post('/api/orders', {
          artwork_id: item.artwork_id || item.id,
          quantity: 1,
          amount: item.amount,
          shipping_address: shippingAddress,
          payment_method: 'upi_qr',
          payment_status: 'pending',
          status: 'pending'
        })
      );

      const orderResponses = await Promise.all(orderPromises);
      const orderId = orderResponses[0].data.order.id;

      // Submit payment proof
      const paymentData = {
        order_id: orderId,
        artwork_id: cartItems[0].artwork_id || cartItems[0].id,
        artist_id: cartItems[0].artist_id,
        transaction_id: transactionId,
        payment_amount: calculateTotal(),
        upi_id: artistUpiDetails.upi_id
      };

      await submitPaymentProof(paymentData, paymentScreenshot);

      alert('Payment proof submitted! Your order will be confirmed after verification.');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      alert(error.response?.data?.error || 'Failed to submit payment proof. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Complete Your Purchase</h1>

        {/* Progress Indicator */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Shipping Details</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Pay to Artist</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Upload Proof</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            
            {/* Step 1: Shipping Details */}
            {step === 1 && (
              <div className="checkout-section">
                <h2>📦 Shipping Information</h2>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={shippingDetails.email}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Complete Address</label>
                  <textarea
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    placeholder="Street address, House number, etc."
                    rows="3"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={shippingDetails.state}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      value={shippingDetails.zipCode}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button 
                  className="btn-primary full-width"
                  onClick={handleContinueToPayment}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              </div>
            )}

            {/* Step 2: Show Artist QR Code */}
            {step === 2 && artistUpiDetails && (
              <div className="checkout-section">
                <h2>💳 Scan QR Code to Pay</h2>
                
                {artistUpiDetails.upi_verified ? (
                  <div className="upi-payment-section">
                    <div className="artist-info">
                      <h3>Pay to Artist: {artistUpiDetails.name || artistUpiDetails.full_name}</h3>
                      <p className="upi-id">UPI ID: <code>{artistUpiDetails.upi_id}</code></p>
                    </div>

                    <div className="qr-code-container">
                      {artistUpiDetails.upi_qr_code ? (
                        <>
                          <img 
                            src={artistUpiDetails.upi_qr_code} 
                            alt="Artist UPI QR Code" 
                            className="qr-code-image"
                          />
                          <p className="payment-amount">Amount to Pay: ₹{calculateTotal().toFixed(2)}</p>
                        </>
                      ) : (
                        <div className="qr-placeholder">
                          <p>Manual UPI Payment</p>
                          <p className="upi-id-large">{artistUpiDetails.upi_id}</p>
                        </div>
                      )}
                    </div>

                    <div className="payment-instructions">
                      <h4>📱 How to Pay:</h4>
                      <ol>
                        <li>Open any UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
                        <li>Scan the QR code above OR enter UPI ID manually</li>
                        <li>Pay amount: ₹{calculateTotal().toFixed(2)}</li>
                        <li>Take a screenshot of the successful payment</li>
                        <li>Click "I Have Paid" below and upload the screenshot</li>
                      </ol>
                    </div>

                    <div className="button-group">
                      <button 
                        className="btn-secondary"
                        onClick={() => setStep(1)}
                      >
                        ← Back
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => setStep(3)}
                      >
                        I Have Paid →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="error-message">
                    <p>⚠️ Artist payment not available. Please contact support.</p>
                    <button onClick={() => navigate('/cart')}>Back to Cart</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Upload Payment Proof */}
            {step === 3 && (
              <div className="checkout-section">
                <h2>📸 Upload Payment Proof</h2>
                
                <div className="form-group">
                  <label>Transaction ID / UTR Number</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from payment app"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Payment Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    required
                  />
                  {paymentScreenshot && (
                    <p className="file-info">✓ {paymentScreenshot.name}</p>
                  )}
                </div>

                <div className="proof-guidelines">
                  <h4>Screenshot Guidelines:</h4>
                  <ul>
                    <li>Clear and readable screenshot</li>
                    <li>Show transaction ID, amount, and date</li>
                    <li>File size less than 5MB</li>
                    <li>Formats: JPG, PNG</li>
                  </ul>
                </div>

                <div className="button-group">
                  <button 
                    className="btn-secondary"
                    onClick={() => setStep(2)}
                  >
                    ← Back
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handlePaymentProofSubmit}
                    disabled={processing}
                  >
                    {processing ? 'Submitting...' : 'Submit Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              {cartItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <img src={item.image_url || item.artworkImage} alt={item.title} />
                  <div className="item-details">
                    <p className="item-title">{item.title}</p>
                    <p className="item-price">₹{parseFloat(item.amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="summary-total">
                <strong>Total Amount:</strong>
                <strong>₹{calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageUPI;
