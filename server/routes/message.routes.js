const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.post('/', authMiddleware, messageController.sendMessage);
router.get('/conversation/:userId', authMiddleware, messageController.getConversation);
router.get('/conversations', authMiddleware, messageController.getAllConversations);
router.patch('/read/:senderId', authMiddleware, messageController.markAsRead);

module.exports = router;
