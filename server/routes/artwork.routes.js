const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artwork.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', artworkController.getAllArtworks);
router.get('/:id', artworkController.getArtworkById);

// Artist routes
router.post('/', authMiddleware, checkRole('artist'), upload.single('image'), artworkController.createArtwork);
router.put('/:id', authMiddleware, checkRole('artist'), upload.single('image'), artworkController.updateArtwork);
router.delete('/:id', authMiddleware, checkRole('artist', 'admin'), artworkController.deleteArtwork);

// Admin routes
router.patch('/:id/status', authMiddleware, checkRole('admin'), artworkController.updateArtworkStatus);

module.exports = router;
