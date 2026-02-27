const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Customer routes - Allow all authenticated users to create/manage orders (artists/admins can buy art too)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/user/:userId', authMiddleware, orderController.getUserOrders);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// Artist routes
router.get('/artist/:artistId', authMiddleware, checkRole('artist', 'admin'), orderController.getArtistSales);

// Admin/Artist routes
router.patch('/:id/status', authMiddleware, checkRole('artist', 'admin'), orderController.updateOrderStatus);

module.exports = router;
