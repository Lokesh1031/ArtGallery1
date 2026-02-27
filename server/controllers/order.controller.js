const { pool } = require('../config/database');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { artwork_id, shipping_address, payment_method, notes, quantity } = req.body;

    console.log('=== CREATE ORDER DEBUG ===');
    console.log('User ID from token:', req.user.id);
    console.log('Request body:', req.body);

    if (!artwork_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide artwork ID'
      });
    }

    // Get artwork details
    const [artworks] = await pool.query(
      'SELECT * FROM artworks WHERE id = ?',
      [artwork_id]
    );

    if (artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const artwork = artworks[0];

    // Check availability only if not a cart item
    if (shipping_address !== 'To be updated' && !artwork.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Artwork is no longer available'
      });
    }

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Determine initial status - pending for cart items, processing for actual orders
    const orderStatus = shipping_address === 'To be updated' ? 'pending' : 'confirmed';

    // Calculate commission (5% to admin, 95% to artist)
    const adminCommission = artwork.price * 0.05;
    const artistPayout = artwork.price * 0.95;

    // Create order
    const [result] = await pool.query(`
      INSERT INTO orders (
        customer_id, artwork_id, artist_id, order_number, amount,
        admin_commission, artist_payout,
        shipping_address, payment_method, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, artwork_id, artwork.artist_id, orderNumber,
      artwork.price, adminCommission, artistPayout,
      shipping_address || 'To be updated', 
      payment_method || 'pending', notes || '', orderStatus
    ]);

    // Only mark artwork as sold if it's an actual order, not a cart item
    if (shipping_address !== 'To be updated') {
      await pool.query(
        'UPDATE artworks SET is_available = FALSE, status = ? WHERE id = ?',
        ['sold', artwork_id]
      );

      // Update artist total sales only for completed orders
      await pool.query(
        'UPDATE artists SET total_sales = total_sales + 1 WHERE user_id = ?',
        [artwork.artist_id]
      );

      // Notify artist about new order
      if (global.emitToUser) {
        global.emitToUser(artwork.artist_id, 'new-order', {
          orderId: result.insertId,
          orderNumber,
          artworkTitle: artwork.title,
          amount: artwork.price,
          customerId: req.user.id,
          timestamp: new Date()
        });

        // Save notification to database
        if (global.saveNotification) {
          global.saveNotification(
            artwork.artist_id,
            'order',
            'New Order Received',
            `You have a new order for "${artwork.title}" - ${orderNumber}`,
            result.insertId
          );
        }
      }

      // Notify admin about new order
      if (global.emitToAdmins) {
        global.emitToAdmins('new-order-admin', {
          orderId: result.insertId,
          orderNumber,
          artworkTitle: artwork.title,
          artistId: artwork.artist_id,
          customerId: req.user.id,
          amount: artwork.price,
          timestamp: new Date()
        });
      }
    }

    res.status(201).json({
      success: true,
      message: orderStatus === 'pending' ? 'Added to cart successfully' : 'Order created successfully',
      orderId: result.insertId,
      orderNumber
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('=== GET USER ORDERS DEBUG ===');
    console.log('Requested userId:', userId);
    console.log('Requesting user ID:', req.user.id);
    console.log('Requesting user role:', req.user.role);

    // Verify user can access these orders
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [orders] = await pool.query(`
      SELECT o.*, a.title as artwork_title, a.image_url,
             u.full_name as artist_name
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      LEFT JOIN users u ON o.artist_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    console.log('Found orders count:', orders.length);
    console.log('Pending cart items:', orders.filter(o => o.status === 'pending' && o.shipping_address === 'To be updated').length);

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get artist sales
exports.getArtistSales = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Verify artist can access these sales
    if (req.user.id !== parseInt(artistId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [orders] = await pool.query(`
      SELECT o.*, a.title as artwork_title, a.image_url,
             u.full_name as customer_name,
             o.admin_commission, o.artist_payout
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.artist_id = ?
      ORDER BY o.created_at DESC
    `, [artistId]);

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0);
    const totalCommission = orders.reduce((sum, order) => sum + parseFloat(order.admin_commission || 0), 0);
    const totalPayout = orders.reduce((sum, order) => sum + parseFloat(order.artist_payout || 0), 0);

    res.json({
      success: true,
      count: orders.length,
      orders,
      summary: {
        totalRevenue,
        totalCommission,
        totalPayout,
        commissionRate: '5%'
      }
    });

  } catch (error) {
    console.error('Get artist sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Delete order (for customers to remove cart items)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Delete order request:', { id, userId, userRole });

    // Check if order belongs to user
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [id, userId]
    );

    console.log('Order found:', orders);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to delete it'
      });
    }

    const order = orders[0];

    // Allow deletion only for pending orders (cart items)
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete order with status: ${order.status}. Only pending cart items can be removed.`
      });
    }

    // Delete the order
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    console.log('Order deleted successfully:', id);

    res.json({
      success: true,
      message: 'Order removed from cart successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove order',
      error: error.message
    });
  }
};

// Update complete order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_address, payment_method, notes, status, payment_status } = req.body;

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const values = [];

    if (shipping_address) {
      updateFields.push('shipping_address = ?');
      values.push(shipping_address);
    }
    if (payment_method) {
      updateFields.push('payment_method = ?');
      values.push(payment_method);
    }
    if (notes) {
      updateFields.push('notes = ?');
      values.push(notes);
    }
    if (status) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (payment_status) {
      updateFields.push('payment_status = ?');
      values.push(payment_status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};
