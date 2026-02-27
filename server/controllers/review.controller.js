const { pool } = require('../config/database');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { artwork_id, rating, comment, artist_rating } = req.body;

    if (!artwork_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide artwork ID and rating'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (artist_rating && (artist_rating < 1 || artist_rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Artist rating must be between 1 and 5'
      });
    }

    // Verify customer purchased this specific artwork and it's been delivered
    const [orders] = await pool.query(
      'SELECT id, artist_id FROM orders WHERE artwork_id = ? AND customer_id = ? AND status = ?',
      [artwork_id, req.user.id, 'delivered']
    );

    if (orders.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only review artworks you have purchased and received'
      });
    }

    const order = orders[0];

    // Check if review already exists for this artwork and customer
    const [existingReviews] = await pool.query(
      'SELECT id FROM reviews WHERE artwork_id = ? AND customer_id = ?',
      [artwork_id, req.user.id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this artwork'
      });
    }

    // Add review
    const [result] = await pool.query(`
      INSERT INTO reviews (artwork_id, customer_id, order_id, rating, comment, artist_rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [artwork_id, req.user.id, order.id, rating, comment, artist_rating || null]);

    // Update artwork rating
    const [ratings] = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE artwork_id = ?',
      [artwork_id]
    );
    
    await pool.query(
      'UPDATE artworks SET rating = ? WHERE id = ?',
      [ratings[0].avg_rating, artwork_id]
    );

    // Update artist rating based on artist_rating field if provided, otherwise use artwork rating
    if (artist_rating) {
      const [artistRatings] = await pool.query(`
        SELECT AVG(artist_rating) as avg_rating
        FROM reviews
        WHERE order_id IN (SELECT id FROM orders WHERE artist_id = ?)
        AND artist_rating IS NOT NULL
      `, [order.artist_id]);

      if (artistRatings[0].avg_rating) {
        await pool.query(
          'UPDATE artists SET rating = ? WHERE user_id = ?',
          [artistRatings[0].avg_rating, order.artist_id]
        );
      }
    }

    // Get artwork details for notification
    const [artworkDetails] = await pool.query(
      'SELECT title FROM artworks WHERE id = ?',
      [artwork_id]
    );

    // Notify artist about new review
    if (global.emitToUser && artworkDetails.length > 0) {
      global.emitToUser(order.artist_id, 'new-review', {
        reviewId: result.insertId,
        artworkId: artwork_id,
        artworkTitle: artworkDetails[0].title,
        rating,
        artist_rating,
        comment,
        customerId: req.user.id,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviewId: result.insertId
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Get artwork reviews (only from verified purchasers)
exports.getArtworkReviews = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const [reviews] = await pool.query(`
      SELECT r.*, u.full_name as customer_name, u.profile_image as customer_image,
             o.order_number, o.status as order_status
      FROM reviews r
      INNER JOIN orders o ON r.order_id = o.id
      INNER JOIN users u ON r.customer_id = u.id
      WHERE r.artwork_id = ? AND o.artwork_id = ? AND o.status = 'delivered'
      ORDER BY r.created_at DESC
    `, [artworkId, artworkId]);

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const [reviews] = await pool.query(`
      SELECT r.*, a.title as artwork_title, a.image_url
      FROM reviews r
      LEFT JOIN artworks a ON r.artwork_id = a.id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Check if user can review artwork
exports.canReviewArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    // Check if user has purchased and received this artwork
    const [orders] = await pool.query(
      'SELECT id FROM orders WHERE artwork_id = ? AND customer_id = ? AND status = ?',
      [artworkId, req.user.id, 'delivered']
    );

    if (orders.length === 0) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'not_purchased'
      });
    }

    // Check if user has already reviewed this artwork
    const [reviews] = await pool.query(
      'SELECT id FROM reviews WHERE artwork_id = ? AND customer_id = ?',
      [artworkId, req.user.id]
    );

    if (reviews.length > 0) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'already_reviewed'
      });
    }

    res.json({
      success: true,
      canReview: true
    });

  } catch (error) {
    console.error('Can review artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message
    });
  }
};

