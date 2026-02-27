const { pool } = require('../config/database');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM artworks WHERE category_id = c.id AND status = 'approved') as artwork_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      ORDER BY c.display_order, c.name
    `);

    res.json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get category tree
exports.getCategoryTree = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY display_order, name');

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id === null) {
        tree.push(categoryMap[cat.id]);
      } else if (categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      }
    });

    res.json({
      success: true,
      categories: tree
    });

  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category tree',
      error: error.message
    });
  }
};
