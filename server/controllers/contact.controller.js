const { pool } = require('../config/database');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO contact_forms (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `, [name, email, subject, message]);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      contactId: result.insertId
    });

  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// Get all contact forms (Admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM contact_forms WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [contacts] = await pool.query(query, params);

    res.json({
      success: true,
      count: contacts.length,
      contacts
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'read', 'responded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await pool.query(
      'UPDATE contact_forms SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Contact status updated successfully'
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
};
