const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Customer routes
router.post('/', authMiddleware, checkRole('customer'), reviewController.addReview);
router.get('/user/:userId', authMiddleware, reviewController.getUserReviews);
router.get('/can-review/:artworkId', authMiddleware, reviewController.canReviewArtwork);

// Public routes
router.get('/artwork/:artworkId', reviewController.getArtworkReviews);

module.exports = router;
