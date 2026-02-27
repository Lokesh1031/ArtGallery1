const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artist.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);

// Artist routes
router.put('/:id', authMiddleware, checkRole('artist', 'admin'), artistController.updateArtistProfile);

// Admin routes
router.patch('/:id/status', authMiddleware, checkRole('admin'), artistController.updateArtistStatus);

module.exports = router;
