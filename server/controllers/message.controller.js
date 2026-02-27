const { pool } = require('../config/database');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message, artwork_id } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, message, artwork_id)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, receiver_id, message, artwork_id]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.insertId
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get conversation
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const [messages] = await pool.query(`
      SELECT m.*, 
             sender.full_name as sender_name, sender.profile_image as sender_image,
             receiver.full_name as receiver_name, receiver.profile_image as receiver_image,
             a.title as artwork_title
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN artworks a ON m.artwork_id = a.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.user.id, userId, userId, req.user.id]);

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [userId, req.user.id]
    );

    res.json({
      success: true,
      count: messages.length,
      messages
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

// Get all conversations
exports.getAllConversations = async (req, res) => {
  try {
    const [conversations] = await pool.query(`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as user_id,
        u.full_name, u.profile_image, u.role,
        (SELECT message FROM messages 
         WHERE (sender_id = ? AND receiver_id = user_id) OR (sender_id = user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = user_id) OR (sender_id = user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = user_id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM messages m
      LEFT JOIN users u ON u.id = CASE
        WHEN m.sender_id = ? THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY last_message_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json({
      success: true,
      count: conversations.length,
      conversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;

    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [senderId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};
