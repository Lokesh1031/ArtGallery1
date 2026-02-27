const { pool } = require('../config/database');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, email, full_name, role, phone, address, profile_image, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address } = req.body;

    // Verify user can update this profile
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let updateQuery = 'UPDATE users SET full_name = ?, phone = ?, address = ?';
    const params = [full_name, phone, address];

    if (req.file) {
      updateQuery += ', profile_image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await pool.query(updateQuery, params);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;

    let query = 'SELECT id, email, full_name, role, phone, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Update user status (Admin only) - approve/reject artists
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'active'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get user details
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    // Notify user about status update
    if (global.emitToUser) {
      global.emitToUser(parseInt(id), 'account-status-update', {
        status,
        role: user.role,
        message: status === 'approved' 
          ? `Your ${user.role} account has been approved!` 
          : status === 'rejected'
          ? `Your ${user.role} account application has been rejected.`
          : `Your account status has been updated to ${status}.`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};
