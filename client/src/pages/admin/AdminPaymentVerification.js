import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPriceSplit } from '../../utils/currency';
import './AdminPaymentVerification.css';

const AdminPaymentVerification = () => {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [pendingUpiRequests, setPendingUpiRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('payments'); // 'payments' or 'upi'
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedUpiRequest, setSelectedUpiRequest] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPendingItems();
    }, [activeTab]);

    const fetchPendingItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (activeTab === 'payments') {
                const response = await axios.get('/api/upi-payments/admin/payments/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingPayments(response.data.payments || []);
            } else {
                const response = await axios.get('/api/upi-payments/admin/upi/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingUpiRequests(response.data.requests || []);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pending items:', error);
            setMessage({ type: 'error', text: 'Failed to load pending items' });
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (paymentId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this payment?`)) {
            return;
        }

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/upi-payments/admin/payments/verify', 
                {
                    payment_id: paymentId,
                    action: action,
                    notes: verificationNotes
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessage({ 
                type: 'success', 
                text: `Payment ${action} successfully!` 
            });

            setSelectedPayment(null);
            setVerificationNotes('');
            fetchPendingItems();

        } catch (error) {
            console.error('Error verifying payment:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to verify payment' 
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleVerifyUpi = async (requestId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this UPI request?`)) {
            return;
        }

        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/upi-payments/admin/upi/verify', 
                {
                    request_id: requestId,
                    action: action,
                    notes: verificationNotes
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessage({ 
                type: 'success', 
                text: `UPI request ${action} successfully!` 
            });

            setSelectedUpiRequest(null);
            setVerificationNotes('');
            fetchPendingItems();

        } catch (error) {
            console.error('Error verifying UPI request:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to verify UPI request' 
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="admin-verification-container">
            <div className="verification-header">
                <h2>🔐 Payment Verification Dashboard</h2>
                <p>Review and verify customer payments and artist UPI details</p>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    💳 Payment Verifications
                    {pendingPayments.length > 0 && (
                        <span className="badge">{pendingPayments.length}</span>
                    )}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upi')}
                >
                    📱 UPI Requests
                    {pendingUpiRequests.length > 0 && (
                        <span className="badge">{pendingUpiRequests.length}</span>
                    )}
                </button>
            </div>

            {message.text && (
                <motion.div 
                    className={`message ${message.type}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Payment Verifications Tab */}
            {activeTab === 'payments' && (
                <div className="verification-content">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : pendingPayments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">✅</div>
                            <h3>All Clear!</h3>
                            <p>No pending payment verifications at the moment</p>
                        </div>
                    ) : (
                        <div className="payments-grid">
                            {pendingPayments.map((payment) => (
                                <motion.div 
                                    key={payment.id}
                                    className="payment-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="payment-header-info">
                                        <span className="payment-id">#{payment.id}</span>
                                        <span className="payment-date">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="payment-artwork">
                                        <img 
                                            src={payment.artwork_image} 
                                            alt={payment.artwork_title} 
                                        />
                                        <div className="artwork-info">
                                            <h4>{payment.artwork_title}</h4>
                                            <div className="price">
                                                {formatPriceSplit(payment.payment_amount).inr}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="payment-details">
                                        <div className="detail-row">
                                            <span className="label">Customer:</span>
                                            <span className="value">{payment.customer_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Artist:</span>
                                            <span className="value">{payment.artist_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">UPI ID:</span>
                                            <span className="value mono">{payment.artist_upi}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Transaction ID:</span>
                                            <span className="value mono">{payment.transaction_id}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="view-details-btn"
                                        onClick={() => setSelectedPayment(payment)}
                                    >
                                        View Screenshot & Verify
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* UPI Requests Tab */}
            {activeTab === 'upi' && (
                <div className="verification-content">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : pendingUpiRequests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">✅</div>
                            <h3>All Clear!</h3>
                            <p>No pending UPI verification requests</p>
                        </div>
                    ) : (
                        <div className="upi-requests-grid">
                            {pendingUpiRequests.map((request) => (
                                <motion.div 
                                    key={request.id}
                                    className="upi-request-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="request-header">
                                        <h4>{request.artist_name}</h4>
                                        <span className="request-date">
                                            {new Date(request.submitted_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="request-details">
                                        <div className="detail-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{request.artist_email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">UPI ID:</span>
                                            <span className="value mono">{request.upi_id}</span>
                                        </div>
                                    </div>

                                    {request.upi_qr_code && (
                                        <div className="qr-preview-small">
                                            <img src={request.upi_qr_code} alt="QR Code" />
                                        </div>
                                    )}

                                    <button 
                                        className="view-details-btn"
                                        onClick={() => setSelectedUpiRequest(request)}
                                    >
                                        Review & Verify
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Payment Details Modal */}
            <AnimatePresence>
                {selectedPayment && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPayment(null)}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Payment Verification</h3>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedPayment(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="payment-screenshot">
                                    <h4>Payment Screenshot:</h4>
                                    <img 
                                        src={selectedPayment.screenshot_path} 
                                        alt="Payment Screenshot" 
                                    />
                                </div>

                                <div className="verification-info">
                                    <h4>Payment Details:</h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Customer:</label>
                                            <span>{selectedPayment.customer_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email:</label>
                                            <span>{selectedPayment.customer_email}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone:</label>
                                            <span>{selectedPayment.customer_phone}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Artwork:</label>
                                            <span>{selectedPayment.artwork_title}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Artist:</label>
                                            <span>{selectedPayment.artist_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Artist UPI:</label>
                                            <span className="mono">{selectedPayment.artist_upi}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Amount:</label>
                                            <span className="amount-highlight">
                                                {formatPriceSplit(selectedPayment.payment_amount).inr}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <label>Transaction ID:</label>
                                            <span className="mono">{selectedPayment.transaction_id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="verification-notes">
                                    <label>Verification Notes (Optional):</label>
                                    <textarea
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        placeholder="Add any notes about this verification..."
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button 
                                        className="reject-btn"
                                        onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                                        disabled={processing}
                                    >
                                        ❌ Reject Payment
                                    </button>
                                    <button 
                                        className="approve-btn"
                                        onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                                        disabled={processing}
                                    >
                                        ✅ Verify Payment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* UPI Request Details Modal */}
                {selectedUpiRequest && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUpiRequest(null)}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>UPI Verification Request</h3>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedUpiRequest(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="upi-qr-large">
                                    <h4>QR Code:</h4>
                                    {selectedUpiRequest.upi_qr_code && (
                                        <img 
                                            src={selectedUpiRequest.upi_qr_code} 
                                            alt="UPI QR Code" 
                                        />
                                    )}
                                </div>

                                <div className="verification-info">
                                    <h4>Artist Details:</h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Name:</label>
                                            <span>{selectedUpiRequest.artist_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email:</label>
                                            <span>{selectedUpiRequest.artist_email}</span>
                                        </div>
                                        <div className="info-item full-width">
                                            <label>UPI ID:</label>
                                            <span className="mono large">{selectedUpiRequest.upi_id}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Submitted:</label>
                                            <span>
                                                {new Date(selectedUpiRequest.submitted_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="verification-notes">
                                    <label>Review Notes (Optional):</label>
                                    <textarea
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        placeholder="Add any notes about this verification..."
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button 
                                        className="reject-btn"
                                        onClick={() => handleVerifyUpi(selectedUpiRequest.id, 'rejected')}
                                        disabled={processing}
                                    >
                                        ❌ Reject Request
                                    </button>
                                    <button 
                                        className="approve-btn"
                                        onClick={() => handleVerifyUpi(selectedUpiRequest.id, 'approved')}
                                        disabled={processing}
                                    >
                                        ✅ Approve UPI
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPaymentVerification;
