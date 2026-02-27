const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bid.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Customer routes
router.post('/', authMiddleware, checkRole('customer'), bidController.placeBid);
router.get('/user/:userId', authMiddleware, bidController.getUserBids);

// Public/Artist routes
router.get('/artwork/:artworkId', bidController.getArtworkBids);

// Artist routes
router.patch('/:id/accept', authMiddleware, checkRole('artist'), bidController.acceptBid);

module.exports = router;
