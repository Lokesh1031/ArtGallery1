const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// Artist UPI Management

// Submit UPI details for verification
exports.submitUpiDetails = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { upi_id } = req.body;
        const artist_id = req.user.id;
        const qr_code_file = req.file;
        
        if (!upi_id || !qr_code_file) {
            return res.status(400).json({ 
                error: 'UPI ID and QR code image are required' 
            });
        }
        
        // Verify user is an artist
        const [artist] = await connection.query(
            'SELECT id, role FROM users WHERE id = ? AND role = "artist"',
            [artist_id]
        );
        
        if (artist.length === 0) {
            return res.status(403).json({ error: 'Only artists can submit UPI details' });
        }
        
        const qr_code_path = `/uploads/${qr_code_file.filename}`;
        
        // Create UPI request for admin approval
        await connection.query(
            `INSERT INTO artist_upi_requests 
            (artist_id, upi_id, upi_qr_code, status) 
            VALUES (?, ?, ?, 'pending')`,
            [artist_id, upi_id, qr_code_path]
        );
        
        res.json({ 
            message: 'UPI details submitted for verification',
            upi_id,
            qr_code_path
        });
        
    } catch (error) {
        console.error('Submit UPI details error:', error);
        res.status(500).json({ error: 'Failed to submit UPI details' });
    } finally {
        connection.release();
    }
};

// Get artist's UPI details
exports.getArtistUpiDetails = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const artist_id = req.params.artistId || req.user.id;
        
        console.log('=== GET ARTIST UPI DETAILS DEBUG ===');
        console.log('Requested artist_id:', artist_id);
        
        // First, check if this is an artist table ID or user table ID
        // Try to find in artists table first (artist_id from orders table)
        const [artistRecord] = await connection.query(
            `SELECT user_id FROM artists WHERE id = ?`,
            [artist_id]
        );
        
        // If found in artists table, use the user_id; otherwise use the provided ID directly
        const user_id = artistRecord.length > 0 ? artistRecord[0].user_id : artist_id;
        
        console.log('Using user_id:', user_id);
        
        const [artist] = await connection.query(
            `SELECT id, full_name as name, email, upi_id, upi_qr_code, upi_verified 
            FROM users 
            WHERE id = ? AND role = 'artist'`,
            [user_id]
        );
        
        console.log('Found artist:', artist.length > 0 ? 'Yes' : 'No');
        
        if (artist.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        // Get pending request if any
        const [pendingRequest] = await connection.query(
            `SELECT * FROM artist_upi_requests 
            WHERE artist_id = ? AND status = 'pending' 
            ORDER BY submitted_at DESC LIMIT 1`,
            [user_id]
        );
        
        res.json({
            artist: artist[0],
            pending_request: pendingRequest[0] || null
        });
        
    } catch (error) {
        console.error('Get artist UPI details error:', error);
        res.status(500).json({ error: 'Failed to get UPI details' });
    } finally {
        connection.release();
    }
};

// Admin: Approve/Reject UPI request
exports.verifyArtistUpi = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { request_id, action, notes } = req.body;
        const admin_id = req.user.id;
        
        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        await connection.beginTransaction();
        
        // Get UPI request
        const [request] = await connection.query(
            'SELECT * FROM artist_upi_requests WHERE id = ?',
            [request_id]
        );
        
        if (request.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'UPI request not found' });
        }
        
        const upiRequest = request[0];
        
        // Update request status
        await connection.query(
            `UPDATE artist_upi_requests 
            SET status = ?, reviewed_by = ?, review_notes = ?, reviewed_at = NOW() 
            WHERE id = ?`,
            [action, admin_id, notes, request_id]
        );
        
        // If approved, update artist's UPI details
        if (action === 'approved') {
            await connection.query(
                `UPDATE users 
                SET upi_id = ?, upi_qr_code = ?, upi_verified = 1, 
                    upi_approved_by = ?, upi_approved_at = NOW() 
                WHERE id = ?`,
                [upiRequest.upi_id, upiRequest.upi_qr_code, admin_id, upiRequest.artist_id]
            );
        }
        
        await connection.commit();
        
        res.json({ 
            message: `UPI request ${action} successfully`,
            action
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Verify artist UPI error:', error);
        res.status(500).json({ error: 'Failed to verify UPI details' });
    } finally {
        connection.release();
    }
};

// Admin: Get all pending UPI requests
exports.getPendingUpiRequests = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const [requests] = await connection.query(
            `SELECT 
                aur.*,
                u.name as artist_name,
                u.email as artist_email
            FROM artist_upi_requests aur
            JOIN users u ON aur.artist_id = u.id
            WHERE aur.status = 'pending'
            ORDER BY aur.submitted_at DESC`
        );
        
        res.json({ requests });
        
    } catch (error) {
        console.error('Get pending UPI requests error:', error);
        res.status(500).json({ error: 'Failed to get pending requests' });
    } finally {
        connection.release();
    }
};

// Customer Payment Proof Submission

// Submit payment screenshot after QR scan payment
exports.submitPaymentProof = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { 
            order_id, 
            artwork_id, 
            artist_id, 
            transaction_id, 
            payment_amount,
            upi_id 
        } = req.body;
        
        const user_id = req.user.id;
        const screenshot_file = req.file;
        
        if (!screenshot_file || !transaction_id) {
            return res.status(400).json({ 
                error: 'Payment screenshot and transaction ID are required' 
            });
        }
        
        await connection.beginTransaction();
        
        // Verify order belongs to user
        const [order] = await connection.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [order_id, user_id]
        );
        
        if (order.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const screenshot_path = `/uploads/${screenshot_file.filename}`;
        
        // Insert payment screenshot record
        const [result] = await connection.query(
            `INSERT INTO payment_screenshots 
            (order_id, user_id, artwork_id, artist_id, screenshot_path, 
             transaction_id, payment_amount, upi_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [order_id, user_id, artwork_id, artist_id, screenshot_path, 
             transaction_id, payment_amount, upi_id]
        );
        
        // Update order status
        await connection.query(
            `UPDATE orders 
            SET payment_method = 'upi_qr', 
                payment_screenshot_id = ?,
                status = 'payment_pending' 
            WHERE id = ?`,
            [result.insertId, order_id]
        );
        
        await connection.commit();
        
        res.json({ 
            message: 'Payment proof submitted successfully. Awaiting admin verification.',
            payment_screenshot_id: result.insertId
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Submit payment proof error:', error);
        res.status(500).json({ error: 'Failed to submit payment proof' });
    } finally {
        connection.release();
    }
};

// Get payment proof details
exports.getPaymentProof = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { payment_id } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;
        
        let query = `
            SELECT 
                ps.*,
                u.name as customer_name,
                u.email as customer_email,
                a.title as artwork_title,
                a.price as artwork_price,
                artist.name as artist_name,
                artist.upi_id as artist_upi,
                o.status as order_status
            FROM payment_screenshots ps
            JOIN users u ON ps.user_id = u.id
            JOIN artworks a ON ps.artwork_id = a.id
            JOIN users artist ON ps.artist_id = artist.id
            JOIN orders o ON ps.order_id = o.id
            WHERE ps.id = ?
        `;
        
        // Non-admin users can only see their own payments
        if (user_role !== 'admin') {
            query += ' AND ps.user_id = ?';
        }
        
        const params = user_role === 'admin' ? [payment_id] : [payment_id, user_id];
        const [payment] = await connection.query(query, params);
        
        if (payment.length === 0) {
            return res.status(404).json({ error: 'Payment proof not found' });
        }
        
        res.json({ payment: payment[0] });
        
    } catch (error) {
        console.error('Get payment proof error:', error);
        res.status(500).json({ error: 'Failed to get payment proof' });
    } finally {
        connection.release();
    }
};

// Admin: Get all pending payment verifications
exports.getPendingPayments = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const [payments] = await connection.query(
            `SELECT 
                ps.*,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                a.title as artwork_title,
                a.price as artwork_price,
                a.image as artwork_image,
                artist.name as artist_name,
                artist.email as artist_email,
                artist.upi_id as artist_upi,
                o.status as order_status
            FROM payment_screenshots ps
            JOIN users u ON ps.user_id = u.id
            JOIN artworks a ON ps.artwork_id = a.id
            JOIN users artist ON ps.artist_id = artist.id
            JOIN orders o ON ps.order_id = o.id
            WHERE ps.status = 'pending'
            ORDER BY ps.created_at DESC`
        );
        
        res.json({ payments });
        
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({ error: 'Failed to get pending payments' });
    } finally {
        connection.release();
    }
};

// Admin: Verify or reject payment
exports.verifyPayment = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { payment_id, action, notes } = req.body;
        const admin_id = req.user.id;
        
        if (!['verified', 'rejected'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        await connection.beginTransaction();
        
        // Get payment details
        const [payment] = await connection.query(
            'SELECT * FROM payment_screenshots WHERE id = ?',
            [payment_id]
        );
        
        if (payment.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        const paymentData = payment[0];
        
        // Update payment screenshot status
        await connection.query(
            `UPDATE payment_screenshots 
            SET status = ?, verified_by = ?, verified_at = NOW(), 
                rejection_reason = ? 
            WHERE id = ?`,
            [action, admin_id, notes, payment_id]
        );
        
        // Update order status
        const orderStatus = action === 'verified' ? 'confirmed' : 'cancelled';
        await connection.query(
            `UPDATE orders 
            SET status = ?, 
                transaction_verified = ?, 
                verification_notes = ? 
            WHERE id = ?`,
            [orderStatus, action === 'verified' ? 1 : 0, notes, paymentData.order_id]
        );
        
        // Add to verification history
        await connection.query(
            `INSERT INTO upi_verification_history 
            (payment_screenshot_id, admin_id, action, notes) 
            VALUES (?, ?, ?, ?)`,
            [payment_id, admin_id, action, notes]
        );
        
        await connection.commit();
        
        res.json({ 
            message: `Payment ${action} successfully`,
            order_id: paymentData.order_id,
            status: orderStatus
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    } finally {
        connection.release();
    }
};

// Get payment verification history
exports.getVerificationHistory = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { payment_id } = req.params;
        
        const [history] = await connection.query(
            `SELECT 
                uvh.*,
                u.name as admin_name
            FROM upi_verification_history uvh
            JOIN users u ON uvh.admin_id = u.id
            WHERE uvh.payment_screenshot_id = ?
            ORDER BY uvh.created_at DESC`,
            [payment_id]
        );
        
        res.json({ history });
        
    } catch (error) {
        console.error('Get verification history error:', error);
        res.status(500).json({ error: 'Failed to get verification history' });
    } finally {
        connection.release();
    }
};

// Customer: Get own payment history
exports.getMyPayments = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const user_id = req.user.id;
        
        const [payments] = await connection.query(
            `SELECT 
                ps.*,
                a.title as artwork_title,
                a.image as artwork_image,
                artist.name as artist_name,
                o.status as order_status
            FROM payment_screenshots ps
            JOIN artworks a ON ps.artwork_id = a.id
            JOIN users artist ON ps.artist_id = artist.id
            JOIN orders o ON ps.order_id = o.id
            WHERE ps.user_id = ?
            ORDER BY ps.created_at DESC`,
            [user_id]
        );
        
        res.json({ payments });
        
    } catch (error) {
        console.error('Get my payments error:', error);
        res.status(500).json({ error: 'Failed to get payment history' });
    } finally {
        connection.release();
    }
};

module.exports = exports;
