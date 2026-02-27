const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Add to wishlist
router.post('/', checkRole('customer'), wishlistController.addToWishlist);

// Get user wishlist
router.get('/user/:userId', wishlistController.getUserWishlist);

// Check if artwork is in wishlist
router.get('/check/:artworkId', wishlistController.checkWishlist);

// Remove from wishlist
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
