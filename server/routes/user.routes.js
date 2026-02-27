const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Protected routes
router.get('/:id', authMiddleware, userController.getUserProfile);
router.put('/:id', authMiddleware, upload.single('profile_image'), userController.updateUserProfile);

// Admin only routes
router.get('/', authMiddleware, checkRole('admin'), userController.getAllUsers);
router.patch('/:id/status', authMiddleware, checkRole('admin'), userController.updateUserStatus);

module.exports = router;
