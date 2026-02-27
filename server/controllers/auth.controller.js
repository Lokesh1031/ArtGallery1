const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, phone, address } = req.body;

    console.log('Register request received:', { email, full_name, role });

    // Validate input
    if (!email || !password || !full_name || !role) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (email, password, full_name, role)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (!['customer', 'artist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either customer or artist'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set status based on role
    const status = role === 'customer' ? 'approved' : 'pending';

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (email, password, full_name, role, phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, role, phone || null, address || null, status]
    );

    console.log('User created successfully:', result.insertId);

    // If artist, create artist profile
    if (role === 'artist') {
      await pool.query(
        'INSERT INTO artists (user_id) VALUES (?)',
        [result.insertId]
      );
      console.log('Artist profile created for user:', result.insertId);
    }

    res.status(201).json({
      success: true,
      message: role === 'artist' 
        ? 'Registration successful! Please wait for admin approval before logging in.' 
        : 'Registration successful! You can now log in.',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is approved (except for customers and admins)
    if (user.role === 'artist' && user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, full_name, role, phone, address, profile_image, status FROM users WHERE id = ?',
      [req.user.id]
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
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};
