const { pool } = require('../config/database');

// Get all artworks (with filters)
exports.getAllArtworks = async (req, res) => {
  try {
    const { category, artist, minPrice, maxPrice, status, search } = req.query;
    
    console.log('=== GET ALL ARTWORKS REQUEST ===');
    console.log('Query params:', req.query);
    console.log('Status value:', status, 'Type:', typeof status);
    
    let query = `
      SELECT a.*, u.full_name as artist_name, u.profile_image as artist_image,
             c.name as category_name,
             (SELECT COUNT(*) FROM reviews WHERE artwork_id = a.id) as review_count
      FROM artworks a
      LEFT JOIN users u ON a.artist_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    // If status is explicitly provided (even empty string to get all), use it
    // Otherwise default to approved for public viewing
    if (status !== undefined && status !== null) {
      if (status !== '') {
        query += ' AND a.status = ?';
        params.push(status);
      }
      // If status is empty string, don't filter by status (show all)
    } else {
      // No status parameter at all - default to approved only
      query += ' AND a.status = ?';
      params.push('approved');
    }

    if (category) {
      query += ' AND a.category_id = ?';
      params.push(category);
    }

    if (artist) {
      query += ' AND a.artist_id = ?';
      params.push(artist);
    }

    if (minPrice) {
      query += ' AND a.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND a.price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      query += ' AND (a.title LIKE ? OR a.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.created_at DESC';

    console.log('Final query:', query);
    console.log('Query params:', params);

    const [artworks] = await pool.query(query, params);

    console.log('Found artworks:', artworks.length);
    console.log('Artworks:', artworks.map(a => ({ id: a.id, title: a.title, status: a.status, artist_id: a.artist_id })));

    res.json({
      success: true,
      count: artworks.length,
      artworks
    });

  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artworks',
      error: error.message
    });
  }
};

// Get single artwork by ID
exports.getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;

    const [artworks] = await pool.query(`
      SELECT a.*, u.full_name as artist_name, u.email as artist_email,
             u.profile_image as artist_image, c.name as category_name,
             art.bio as artist_bio, art.specialization,
             (SELECT COUNT(*) FROM reviews WHERE artwork_id = a.id) as review_count
      FROM artworks a
      LEFT JOIN users u ON a.artist_id = u.id
      LEFT JOIN artists art ON u.id = art.user_id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `, [id]);

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    // Fetch reviews for this artwork (only from verified purchasers)
    const [reviews] = await pool.query(`
      SELECT r.*, u.full_name as user_name, u.profile_image as user_image,
             o.order_number
      FROM reviews r
      INNER JOIN orders o ON r.order_id = o.id
      INNER JOIN users u ON r.customer_id = u.id
      WHERE r.artwork_id = ? AND o.artwork_id = ? AND o.status = 'delivered'
      ORDER BY r.created_at DESC
    `, [id, id]);

    // Add reviews to artwork object
    const artwork = {
      ...artworks[0],
      reviews: reviews || []
    };

    // Increment view count
    await pool.query('UPDATE artworks SET views = views + 1 WHERE id = ?', [id]);

    res.json({
      success: true,
      artwork: artwork
    });

  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artwork',
      error: error.message
    });
  }
};

// Create new artwork (Artist only)
exports.createArtwork = async (req, res) => {
  try {
    console.log('=== CREATE ARTWORK REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    console.log('File:', req.file);
    console.log('============================');

    const {
      title, description, category_id, price, materials,
      dimensions, year_created, provenance, bidding_enabled
    } = req.body;

    // Validation
    if (!title || !price) {
      console.log('Validation failed: Missing title or price');
      return res.status(400).json({
        success: false,
        message: 'Title and price are required'
      });
    }

    // Validate price cap (max ₹5 lakh)
    if (parseFloat(price) > 500000) {
      console.log('Validation failed: Price exceeds maximum limit');
      return res.status(400).json({
        success: false,
        message: 'Price cannot exceed ₹5,00,000 (5 lakh rupees)'
      });
    }

    if (!req.file) {
      console.log('Validation failed: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Check if user is an artist
    if (!req.user || !req.user.id) {
      console.log('Authentication failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Using artist_id (user.id):', req.user.id);

    const image_url = `/uploads/${req.file.filename}`;
    console.log('Image URL:', image_url);

    const queryParams = [
      req.user.id,
      title,
      description || null,
      category_id || null,
      price,
      image_url,
      materials || null,
      dimensions || null,
      year_created || null,
      provenance || null,
      bidding_enabled === 'true' || bidding_enabled === true ? 1 : 0
    ];

    console.log('Query parameters:', queryParams);

    // Insert artwork with proper NULL handling
    const [result] = await pool.query(`
      INSERT INTO artworks (
        artist_id, title, description, category_id, price,
        image_url, materials, dimensions, year_created,
        provenance, bidding_enabled, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, queryParams);

    console.log('Artwork created successfully with ID:', result.insertId);

    // Notify admins about new artwork submission
    if (global.emitToAdmins) {
      global.emitToAdmins('new-artwork-submission', {
        artworkId: result.insertId,
        artistId: req.user.id,
        title,
        price,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Artwork uploaded successfully! Waiting for admin approval.',
      artworkId: result.insertId
    });

  } catch (error) {
    console.error('=== CREATE ARTWORK ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('============================');
    
    res.status(500).json({
      success: false,
      message: 'Failed to create artwork',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
};

// Update artwork (Artist only - own artworks)
exports.updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, category_id, price, materials,
      dimensions, year_created, provenance, bidding_enabled
    } = req.body;

    // Validate price cap (max ₹5 lakh)
    if (price && parseFloat(price) > 500000) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot exceed ₹5,00,000 (5 lakh rupees)'
      });
    }

    // Check if artwork belongs to the artist
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ? AND artist_id = ?',
      [id, req.user.id]
    );

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found or you do not have permission to update it'
      });
    }

    let updateQuery = `
      UPDATE artworks SET
        title = ?, description = ?, category_id = ?, price = ?,
        materials = ?, dimensions = ?, year_created = ?,
        provenance = ?, bidding_enabled = ?
    `;
    const params = [
      title, description, category_id, price, materials,
      dimensions, year_created, provenance, bidding_enabled
    ];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await pool.query(updateQuery, params);

    res.json({
      success: true,
      message: 'Artwork updated successfully'
    });

  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update artwork',
      error: error.message
    });
  }
};

// Delete artwork
exports.deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership or admin role
    let query = 'SELECT * FROM artworks WHERE id = ?';
    const params = [id];

    if (req.user.role !== 'admin') {
      query += ' AND artist_id = ?';
      params.push(req.user.id);
    }

    const [artworks] = await pool.query(query, params);

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found or you do not have permission to delete it'
      });
    }

    await pool.query('DELETE FROM artworks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Artwork deleted successfully'
    });

  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artwork',
      error: error.message
    });
  }
};

// Approve/Reject artwork (Admin only)
exports.updateArtworkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get artwork details including artist info
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [id]
    );

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const artwork = artworks[0];

    await pool.query(
      'UPDATE artworks SET status = ? WHERE id = ?',
      [status, id]
    );

    // Notify artist about artwork status update
    if (global.emitToUser) {
      global.emitToUser(artwork.artist_id, 'artwork-status-update', {
        artworkId: id,
        artworkTitle: artwork.title,
        status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: `Artwork ${status} successfully`
    });

  } catch (error) {
    console.error('Update artwork status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update artwork status',
      error: error.message
    });
  }
};
