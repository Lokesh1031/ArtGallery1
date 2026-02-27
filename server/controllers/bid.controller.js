const { pool } = require('../config/database');

// Place bid
exports.placeBid = async (req, res) => {
  try {
    const { artwork_id, bid_amount, message } = req.body;

    if (!artwork_id || !bid_amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if artwork exists and bidding is enabled
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ? AND bidding_enabled = TRUE AND is_available = TRUE',
      [artwork_id]
    );

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not available for bidding'
      });
    }

    const artwork = artworks[0];

    // Check if bid is higher than current bid
    if (parseFloat(bid_amount) <= parseFloat(artwork.current_bid)) {
      const inrAmount = (artwork.current_bid * 83).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `Bid must be higher than current bid of $${artwork.current_bid} (₹${inrAmount})`
      });
    }

    // Mark previous bids as outbid
    await pool.query(
      'UPDATE bids SET status = ? WHERE artwork_id = ? AND status = ?',
      ['outbid', artwork_id, 'active']
    );

    // Place new bid
    const [result] = await pool.query(`
      INSERT INTO bids (artwork_id, customer_id, bid_amount, message)
      VALUES (?, ?, ?, ?)
    `, [artwork_id, req.user.id, bid_amount, message]);

    // Update artwork current bid
    await pool.query(
      'UPDATE artworks SET current_bid = ? WHERE id = ?',
      [bid_amount, artwork_id]
    );

    // Notify artist about new bid
    if (global.emitToUser) {
      global.emitToUser(artwork.artist_id, 'new-bid', {
        bidId: result.insertId,
        artworkId: artwork_id,
        artworkTitle: artwork.title,
        bidAmount: bid_amount,
        customerId: req.user.id,
        message,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bidId: result.insertId
    });

  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid',
      error: error.message
    });
  }
};

// Get bids for artwork
exports.getArtworkBids = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const [bids] = await pool.query(`
      SELECT b.*, u.full_name as customer_name, u.profile_image as customer_image
      FROM bids b
      LEFT JOIN users u ON b.customer_id = u.id
      WHERE b.artwork_id = ?
      ORDER BY b.bid_amount DESC, b.created_at DESC
    `, [artworkId]);

    res.json({
      success: true,
      count: bids.length,
      bids
    });

  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids',
      error: error.message
    });
  }
};

// Accept bid (Artist only)
exports.acceptBid = async (req, res) => {
  try {
    const { id } = req.params;

    // Get bid details
    const [bids] = await pool.query(`
      SELECT b.*, a.artist_id
      FROM bids b
      LEFT JOIN artworks a ON b.artwork_id = a.id
      WHERE b.id = ?
    `, [id]);

    if (bids.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const bid = bids[0];

    // Verify artist owns the artwork
    if (bid.artist_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update bid status
    await pool.query('UPDATE bids SET status = ? WHERE id = ?', ['accepted', id]);

    // Reject other bids
    await pool.query(
      'UPDATE bids SET status = ? WHERE artwork_id = ? AND id != ?',
      ['rejected', bid.artwork_id, id]
    );

    // Get artwork details for notification
    const [artworkDetails] = await pool.query(
      'SELECT title FROM artworks WHERE id = ?',
      [bid.artwork_id]
    );

    // Notify customer that their bid was accepted
    if (global.emitToUser && artworkDetails.length > 0) {
      global.emitToUser(bid.customer_id, 'bid-accepted', {
        bidId: id,
        artworkId: bid.artwork_id,
        artworkTitle: artworkDetails[0].title,
        bidAmount: bid.bid_amount,
        artistId: bid.artist_id,
        timestamp: new Date()
      });
    }

    // Notify other bidders that their bids were rejected
    const [rejectedBids] = await pool.query(
      'SELECT customer_id FROM bids WHERE artwork_id = ? AND id != ? AND status = ?',
      [bid.artwork_id, id, 'rejected']
    );

    if (global.emitToUser && artworkDetails.length > 0) {
      rejectedBids.forEach(rejectedBid => {
        global.emitToUser(rejectedBid.customer_id, 'bid-rejected', {
          artworkId: bid.artwork_id,
          artworkTitle: artworkDetails[0].title,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: 'Bid accepted successfully'
    });

  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept bid',
      error: error.message
    });
  }
};

// Get user bids
exports.getUserBids = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access these bids
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [bids] = await pool.query(`
      SELECT b.*, a.title as artwork_title, a.image_url,
             u.full_name as artist_name
      FROM bids b
      LEFT JOIN artworks a ON b.artwork_id = a.id
      LEFT JOIN users u ON a.artist_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: bids.length,
      bids
    });

  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids',
      error: error.message
    });
  }
};
