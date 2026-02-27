const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.get('/dashboard', authMiddleware, statsController.getDashboardStats);
router.get('/activities', authMiddleware, statsController.getRecentActivities);

module.exports = router;
