const { pool } = require('../config/database');

// Get all artists
exports.getAllArtists = async (req, res) => {
  try {
    const { status, verified } = req.query;
    
    let query = `
      SELECT u.id, u.email, u.full_name, u.phone, u.profile_image, u.status, u.created_at,
             a.bio, a.specialization, a.portfolio_url, a.social_links, 
             a.verified, a.rating, a.total_sales,
             (SELECT COUNT(*) FROM artworks WHERE artist_id = u.id AND status = 'approved') as artwork_count
      FROM users u
      INNER JOIN artists a ON u.id = a.user_id
      WHERE u.role = 'artist'
    `;
    const params = [];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (verified !== undefined) {
      query += ' AND a.verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    query += ' ORDER BY u.created_at DESC';

    const [artists] = await pool.query(query, params);

    res.json({
      success: true,
      count: artists.length,
      artists
    });

  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
      error: error.message
    });
  }
};

// Get single artist by ID
exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.phone, u.profile_image, u.status, u.created_at,
             a.bio, a.specialization, a.portfolio_url, a.social_links, 
             a.verified, a.rating, a.total_sales
      FROM users u
      INNER JOIN artists a ON u.id = a.user_id
      WHERE u.id = ? AND u.role = 'artist'
    `, [id]);

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // Get artist's artworks
    const [artworks] = await pool.query(`
      SELECT id, title, description, price, image_url, rating, views, status, created_at
      FROM artworks
      WHERE artist_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      artist: {
        ...artists[0],
        artworks
      }
    });

  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist',
      error: error.message
    });
  }
};

// Update artist profile
exports.updateArtistProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, specialization, portfolio_url, social_links } = req.body;

    // Check if the artist owns this profile
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this profile'
      });
    }

    await pool.query(`
      UPDATE artists SET
        bio = ?, specialization = ?, portfolio_url = ?, social_links = ?
      WHERE user_id = ?
    `, [bio, specialization, portfolio_url, JSON.stringify(social_links), id]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update artist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Approve/Reject artist (Admin only)
exports.updateArtistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      [status, id, 'artist']
    );

    res.json({
      success: true,
      message: `Artist ${status} successfully`
    });

  } catch (error) {
    console.error('Update artist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update artist status',
      error: error.message
    });
  }
};
