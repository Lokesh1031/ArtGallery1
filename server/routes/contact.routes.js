const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Public route
router.post('/', contactController.submitContact);

// Admin routes
router.get('/', authMiddleware, checkRole('admin'), contactController.getAllContacts);
router.patch('/:id/status', authMiddleware, checkRole('admin'), contactController.updateContactStatus);

module.exports = router;
