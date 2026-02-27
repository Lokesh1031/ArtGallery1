const { pool } = require('../config/database');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { artwork_id } = req.body;
    const user_id = req.user.id;

    // Check if already in wishlist
    const [existing] = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND artwork_id = ?',
      [user_id, artwork_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already in wishlist'
      });
    }

    await pool.query(
      'INSERT INTO wishlist (user_id, artwork_id) VALUES (?, ?)',
      [user_id, artwork_id]
    );

    res.status(201).json({
      success: true,
      message: 'Added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

// Get user wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access this wishlist
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [wishlistItems] = await pool.query(`
      SELECT w.id as wishlist_id, w.created_at as added_at,
             a.*, u.full_name as artist_name
      FROM wishlist w
      LEFT JOIN artworks a ON w.artwork_id = a.id
      LEFT JOIN users u ON a.artist_id = u.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: wishlistItems.length,
      wishlist: wishlistItems
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    await pool.query(
      'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    res.json({
      success: true,
      message: 'Removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

// Check if artwork is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND artwork_id = ?',
      [user_id, artworkId]
    );

    res.json({
      success: true,
      inWishlist: result.length > 0,
      wishlistId: result.length > 0 ? result[0].id : null
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};
