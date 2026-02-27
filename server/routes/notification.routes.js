const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.get('/', authMiddleware, notificationController.getUserNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
