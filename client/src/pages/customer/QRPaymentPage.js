import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { formatPriceSplit } from '../../utils/currency';
import './QRPaymentPage.css';

const QRPaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order, artwork, artist } = location.state || {};

    const [paymentProof, setPaymentProof] = useState({
        screenshot: null,
        transaction_id: ''
    });
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!order || !artwork || !artist) {
            navigate('/cart');
        }
    }, [order, artwork, artist, navigate]);

    const handleScreenshotUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentProof({ ...paymentProof, screenshot: file });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTransactionIdChange = (e) => {
        setPaymentProof({ ...paymentProof, transaction_id: e.target.value });
    };

    const copyUpiId = () => {
        navigator.clipboard.writeText(artist.upi_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentProof.screenshot || !paymentProof.transaction_id) {
            setMessage({ 
                type: 'error', 
                text: 'Please upload payment screenshot and enter transaction ID' 
            });
            return;
        }

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('screenshot', paymentProof.screenshot);
            formData.append('transaction_id', paymentProof.transaction_id);
            formData.append('order_id', order.id);
            formData.append('artwork_id', artwork.id);
            formData.append('artist_id', artist.id);
            formData.append('payment_amount', order.total_amount);
            formData.append('upi_id', artist.upi_id);

            await axios.post('/api/upi-payments/payment-proof/submit', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ 
                type: 'success', 
                text: 'Payment proof submitted successfully! Your order is under verification.' 
            });

            setTimeout(() => {
                navigate('/customer/orders');
            }, 3000);

        } catch (error) {
            console.error('Error submitting payment proof:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to submit payment proof' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!order || !artwork || !artist) {
        return null;
    }

    const { inr } = formatPriceSplit(order.total_amount);

    return (
        <div className="qr-payment-container">
            <motion.div 
                className="qr-payment-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="payment-header">
                    <h2>🎨 Complete Your Payment</h2>
                    <p>Scan the QR code below to pay directly to the artist</p>
                </div>

                {/* Artist Info */}
                <div className="artist-info-section">
                    <div className="artist-avatar">
                        {artist.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="artist-details">
                        <h3>{artist.name}</h3>
                        <p className="artist-role">Artist</p>
                    </div>
                </div>

                {/* Artwork Info */}
                <div className="artwork-info-section">
                    <div className="artwork-image">
                        <img src={artwork.image} alt={artwork.title} />
                    </div>
                    <div className="artwork-details">
                        <h3>{artwork.title}</h3>
                        <div className="artwork-price">
                            <span className="price-inr">{inr}</span>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <motion.div 
                    className="qr-code-section"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                >
                    <h3>📱 Scan to Pay</h3>
                    <div className="qr-code-display">
                        <img 
                            src={artist.upi_qr_code} 
                            alt="Artist UPI QR Code" 
                            className="qr-code-image"
                        />
                    </div>
                    <div className="qr-code-info">
                        <p className="scan-instruction">
                            Open any UPI app (PhonePe, Google Pay, Paytm) and scan this QR code
                        </p>
                    </div>
                </motion.div>

                {/* UPI ID Section */}
                <div className="upi-id-section">
                    <label>Or use UPI ID:</label>
                    <div className="upi-id-display">
                        <span className="upi-id-text">{artist.upi_id}</span>
                        <button 
                            className="copy-btn"
                            onClick={copyUpiId}
                        >
                            {copied ? '✓ Copied' : '📋 Copy'}
                        </button>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="amount-display">
                    <span>Amount to Pay:</span>
                    <div className="amount-values">
                        <span className="amount-inr">{inr}</span>
                    </div>
                </div>

                {/* Payment Proof Upload Section */}
                <div className="payment-proof-section">
                    <h3>📸 Upload Payment Proof</h3>
                    <p className="proof-instruction">
                        After completing the payment, upload a screenshot and transaction ID
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="screenshot">Payment Screenshot *</label>
                            <input
                                type="file"
                                id="screenshot"
                                accept="image/*"
                                onChange={handleScreenshotUpload}
                                required
                            />
                            {screenshotPreview && (
                                <div className="screenshot-preview">
                                    <img src={screenshotPreview} alt="Payment Screenshot" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="transaction_id">Transaction ID / UTR Number *</label>
                            <input
                                type="text"
                                id="transaction_id"
                                value={paymentProof.transaction_id}
                                onChange={handleTransactionIdChange}
                                placeholder="Enter 12-digit transaction ID"
                                minLength="12"
                                required
                            />
                            <small>Find this in your payment success message or transaction history</small>
                        </div>

                        {message.text && (
                            <motion.div 
                                className={`message ${message.type}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => navigate('/cart')}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Instructions */}
                <div className="payment-instructions">
                    <h4>📝 How to Pay:</h4>
                    <ol>
                        <li>Open your UPI app (PhonePe, Google Pay, or Paytm)</li>
                        <li>Scan the QR code or enter the UPI ID manually</li>
                        <li>Enter the exact amount shown above</li>
                        <li>Complete the payment</li>
                        <li>Take a screenshot of the success message</li>
                        <li>Upload the screenshot and enter transaction ID here</li>
                        <li>Wait for admin verification (usually within 24 hours)</li>
                    </ol>
                </div>
            </motion.div>
        </div>
    );
};

export default QRPaymentPage;
