const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const artworkRoutes = require('./routes/artwork.routes');
const artistRoutes = require('./routes/artist.routes');
const orderRoutes = require('./routes/order.routes');
const bidRoutes = require('./routes/bid.routes');
const reviewRoutes = require('./routes/review.routes');
const categoryRoutes = require('./routes/category.routes');
const contactRoutes = require('./routes/contact.routes');
const messageRoutes = require('./routes/message.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const notificationRoutes = require('./routes/notification.routes');
const statsRoutes = require('./routes/stats.routes');
// const paymentRoutes = require('./routes/payment.routes'); // Razorpay - Disabled
const upiPaymentRoutes = require('./routes/upi-payment.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
// app.use('/api/payments', paymentRoutes); // Razorpay - Disabled
app.use('/api/upi-payments', upiPaymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Art Gallery API is running' });
});

// Socket.io connection handling
const activeUsers = new Map();

// Make io and activeUsers globally accessible
global.io = io;
global.activeUsers = activeUsers;

// Helper function to emit to specific user
global.emitToUser = (userId, event, data) => {
  const socketId = activeUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Helper function to emit to all admins
global.emitToAdmins = async (event, data) => {
  const { pool } = require('./config/database');
  try {
    const [admins] = await pool.query('SELECT id FROM users WHERE role = ?', ['admin']);
    admins.forEach(admin => {
      const socketId = activeUsers.get(admin.id);
      if (socketId) {
        io.to(socketId).emit(event, data);
      }
    });
  } catch (error) {
    console.error('Error emitting to admins:', error);
  }
};

// Helper function to save notification to database
global.saveNotification = async (userId, type, title, message, relatedId = null) => {
  const { pool } = require('./config/database');
  try {
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, type, title, message, relatedId]);
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user-connected', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
    
    // Broadcast online users count
    io.emit('online-users-update', { count: activeUsers.size });
  });

  socket.on('send-message', async (data) => {
    const { receiverId, senderId, message, artworkId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', {
        senderId,
        message,
        artworkId,
        timestamp: new Date()
      });
    }
  });

  socket.on('typing', (data) => {
    const { receiverId, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', { senderId });
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        
        // Broadcast online users count
        io.emit('online-users-update', { count: activeUsers.size });
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Warning: Database connection failed. Please check your configuration.');
      console.log('💡 Tip: Run "node server/database/init-db.js" to initialize the database.');
    }

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📝 API: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`\n⌨️  Press CTRL+C to stop\n`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`);
      } else {
        console.error('\n❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
