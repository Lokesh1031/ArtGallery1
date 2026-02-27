import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './ArtistUpiSetup.css';

const ArtistUpiSetup = () => {
    const [upiDetails, setUpiDetails] = useState({
        upi_id: '',
        upi_qr_code: '',
        upi_verified: false
    });
    const [pendingRequest, setPendingRequest] = useState(null);
    const [formData, setFormData] = useState({
        upi_id: '',
        qr_code_file: null
    });
    const [qrPreview, setQrPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUpiDetails();
    }, []);

    const fetchUpiDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/upi-payments/artist/upi', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUpiDetails(response.data.artist);
            setPendingRequest(response.data.pending_request);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching UPI details:', error);
            setMessage({ type: 'error', text: 'Failed to load UPI details' });
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                qr_code_file: file
            });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();
            submitData.append('upi_id', formData.upi_id);
            submitData.append('qr_code', formData.qr_code_file);

            await axios.post('/api/upi-payments/artist/upi/submit', submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ 
                type: 'success', 
                text: 'UPI details submitted successfully! Awaiting admin verification.' 
            });
            
            // Refresh details
            setTimeout(() => {
                fetchUpiDetails();
                setFormData({ upi_id: '', qr_code_file: null });
                setQrPreview(null);
            }, 2000);

        } catch (error) {
            console.error('Error submitting UPI details:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to submit UPI details' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="upi-setup-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="upi-setup-container">
            <motion.div 
                className="upi-setup-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="upi-setup-title">💳 UPI Payment Setup</h2>
                <p className="upi-setup-subtitle">
                    Set up your UPI details to receive direct payments from customers
                </p>

                {/* Current Status */}
                {upiDetails.upi_verified ? (
                    <motion.div 
                        className="upi-status verified"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="status-icon">✅</div>
                        <div className="status-content">
                            <h3>UPI Account Verified</h3>
                            <p>Your UPI details are approved and active</p>
                            <div className="upi-details">
                                <div className="upi-field">
                                    <label>UPI ID:</label>
                                    <span className="upi-value">{upiDetails.upi_id}</span>
                                </div>
                                {upiDetails.upi_qr_code && (
                                    <div className="qr-display">
                                        <label>Your QR Code:</label>
                                        <img 
                                            src={upiDetails.upi_qr_code} 
                                            alt="UPI QR Code" 
                                            className="qr-code-image"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : pendingRequest ? (
                    <motion.div 
                        className="upi-status pending"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="status-icon">⏳</div>
                        <div className="status-content">
                            <h3>Verification Pending</h3>
                            <p>Your UPI details are under review by admin</p>
                            <div className="upi-details">
                                <div className="upi-field">
                                    <label>Submitted UPI ID:</label>
                                    <span className="upi-value">{pendingRequest.upi_id}</span>
                                </div>
                                <div className="upi-field">
                                    <label>Submitted on:</label>
                                    <span className="upi-value">
                                        {new Date(pendingRequest.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {pendingRequest.upi_qr_code && (
                                    <div className="qr-display">
                                        <label>Submitted QR Code:</label>
                                        <img 
                                            src={pendingRequest.upi_qr_code} 
                                            alt="Pending QR Code" 
                                            className="qr-code-image"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="upi-status not-setup"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="status-icon">⚠️</div>
                        <div className="status-content">
                            <h3>UPI Not Set Up</h3>
                            <p>Please submit your UPI details to start receiving payments</p>
                        </div>
                    </motion.div>
                )}

                {/* Setup Form (only show if not verified and no pending request) */}
                {!upiDetails.upi_verified && !pendingRequest && (
                    <form onSubmit={handleSubmit} className="upi-setup-form">
                        <div className="form-section">
                            <h3>📱 Enter Your UPI Details</h3>
                            
                            <div className="form-group">
                                <label htmlFor="upi_id">UPI ID *</label>
                                <input
                                    type="text"
                                    id="upi_id"
                                    name="upi_id"
                                    value={formData.upi_id}
                                    onChange={handleInputChange}
                                    placeholder="yourname@upi (e.g., artistname@paytm)"
                                    required
                                    pattern="[a-zA-Z0-9._-]+@[a-zA-Z]+"
                                />
                                <small>Example: yourname@paytm, yourname@phonepe, yourname@googlepay</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="qr_code">Upload QR Code Image *</label>
                                <input
                                    type="file"
                                    id="qr_code"
                                    name="qr_code"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                />
                                <small>Upload your PhonePe/Google Pay/Paytm QR code screenshot</small>
                            </div>

                            {qrPreview && (
                                <div className="qr-preview">
                                    <label>QR Code Preview:</label>
                                    <img src={qrPreview} alt="QR Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-instructions">
                            <h4>📝 How to get your QR code:</h4>
                            <ol>
                                <li>Open PhonePe/Google Pay/Paytm app</li>
                                <li>Go to "My QR Code" or "Receive Money"</li>
                                <li>Take a screenshot of your QR code</li>
                                <li>Upload it here along with your UPI ID</li>
                            </ol>
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

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={submitting || !formData.upi_id || !formData.qr_code_file}
                        >
                            {submitting ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                    </form>
                )}

                {/* Info Section */}
                <div className="info-section">
                    <h4>ℹ️ Important Information</h4>
                    <ul>
                        <li>Your UPI details will be verified by admin before activation</li>
                        <li>Once verified, customers can pay you directly via QR code</li>
                        <li>Ensure your UPI ID and QR code are correct and active</li>
                        <li>You'll receive notifications when payments are made</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default ArtistUpiSetup;
