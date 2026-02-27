const { pool } = require('../config/database');

// Get dashboard stats based on user role
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let stats = {};

    if (userRole === 'admin') {
      // Admin statistics
      const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
      const [pendingUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = ?', ['pending']);
      const [totalArtworks] = await pool.query('SELECT COUNT(*) as count FROM artworks');
      const [pendingArtworks] = await pool.query('SELECT COUNT(*) as count FROM artworks WHERE status = ?', ['pending']);
      const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
      const [todayOrders] = await pool.query(
        'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
      );
      const [totalRevenue] = await pool.query('SELECT SUM(amount) as total FROM orders WHERE status != ?', ['pending']);

      stats = {
        totalUsers: totalUsers[0].count,
        pendingUsers: pendingUsers[0].count,
        totalArtworks: totalArtworks[0].count,
        pendingArtworks: pendingArtworks[0].count,
        totalOrders: totalOrders[0].count,
        todayOrders: todayOrders[0].count,
        totalRevenue: totalRevenue[0].total || 0
      };

    } else if (userRole === 'artist') {
      // Artist statistics
      const [myArtworks] = await pool.query('SELECT COUNT(*) as count FROM artworks WHERE artist_id = ?', [userId]);
      const [soldArtworks] = await pool.query('SELECT COUNT(*) as count FROM artworks WHERE artist_id = ? AND status = ?', [userId, 'sold']);
      const [totalSales] = await pool.query('SELECT SUM(amount) as total FROM orders WHERE artist_id = ? AND status != ?', [userId, 'pending']);
      const [pendingArtworks] = await pool.query('SELECT COUNT(*) as count FROM artworks WHERE artist_id = ? AND status = ?', [userId, 'pending']);
      const [activeBids] = await pool.query(`
        SELECT COUNT(DISTINCT b.artwork_id) as count 
        FROM bids b
        JOIN artworks a ON b.artwork_id = a.id
        WHERE a.artist_id = ? AND b.status = ?
      `, [userId, 'active']);
      const [reviews] = await pool.query(`
        SELECT COUNT(*) as count
        FROM reviews r
        JOIN artworks a ON r.artwork_id = a.id
        WHERE a.artist_id = ?
      `, [userId]);

      stats = {
        myArtworks: myArtworks[0].count,
        soldArtworks: soldArtworks[0].count,
        totalSales: totalSales[0].total || 0,
        pendingArtworks: pendingArtworks[0].count,
        activeBids: activeBids[0].count,
        totalReviews: reviews[0].count
      };

    } else if (userRole === 'customer') {
      // Customer statistics
      const [cartItems] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE customer_id = ? AND status = ?', [userId, 'pending']);
      const [myOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE customer_id = ? AND status != ?', [userId, 'pending']);
      const [wishlistItems] = await pool.query('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?', [userId]);
      const [myBids] = await pool.query('SELECT COUNT(*) as count FROM bids WHERE customer_id = ?', [userId]);
      const [activeBids] = await pool.query('SELECT COUNT(*) as count FROM bids WHERE customer_id = ? AND status = ?', [userId, 'active']);
      const [myReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE customer_id = ?', [userId]);

      stats = {
        cartItems: cartItems[0].count,
        myOrders: myOrders[0].count,
        wishlistItems: wishlistItems[0].count,
        totalBids: myBids[0].count,
        activeBids: activeBids[0].count,
        myReviews: myReviews[0].count
      };
    }

    res.json({
      success: true,
      role: userRole,
      stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// Get recent activities based on user role
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 10 } = req.query;
    let activities = [];

    if (userRole === 'admin') {
      // Recent admin activities
      const [recentOrders] = await pool.query(`
        SELECT 'order' as type, o.id, o.order_number, o.amount, o.status, o.created_at,
               a.title as artwork_title, u.full_name as customer_name
        FROM orders o
        JOIN artworks a ON o.artwork_id = a.id
        JOIN users u ON o.customer_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `, [parseInt(limit)]);

      activities = recentOrders;

    } else if (userRole === 'artist') {
      // Recent artist activities
      const [recentActivities] = await pool.query(`
        (SELECT 'order' as type, o.id, o.created_at, a.title as title, 'New order received' as description
         FROM orders o
         JOIN artworks a ON o.artwork_id = a.id
         WHERE a.artist_id = ? AND o.status != 'pending')
        UNION
        (SELECT 'bid' as type, b.id, b.created_at, a.title, CONCAT('New bid: $', b.bid_amount) as description
         FROM bids b
         JOIN artworks a ON b.artwork_id = a.id
         WHERE a.artist_id = ?)
        UNION
        (SELECT 'review' as type, r.id, r.created_at, a.title, CONCAT('New review: ', r.rating, ' stars') as description
         FROM reviews r
         JOIN artworks a ON r.artwork_id = a.id
         WHERE a.artist_id = ?)
        ORDER BY created_at DESC
        LIMIT ?
      `, [userId, userId, userId, parseInt(limit)]);

      activities = recentActivities;

    } else if (userRole === 'customer') {
      // Recent customer activities
      const [recentActivities] = await pool.query(`
        (SELECT 'order' as type, o.id, o.created_at, a.title as title, CONCAT('Order ', o.status) as description
         FROM orders o
         JOIN artworks a ON o.artwork_id = a.id
         WHERE o.customer_id = ? AND o.status != 'pending')
        UNION
        (SELECT 'bid' as type, b.id, b.created_at, a.title, CONCAT('Bid ', b.status, ': $', b.bid_amount) as description
         FROM bids b
         JOIN artworks a ON b.artwork_id = a.id
         WHERE b.customer_id = ?)
        ORDER BY created_at DESC
        LIMIT ?
      `, [userId, userId, parseInt(limit)]);

      activities = recentActivities;
    }

    res.json({
      success: true,
      count: activities.length,
      activities
    });

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

module.exports = exports;
