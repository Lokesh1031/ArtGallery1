const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupCategories() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'art_gallery_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔄 Cleaning up duplicate categories...\n');

    // Delete all artworks first (to avoid foreign key constraints)
    await connection.query('DELETE FROM artworks');
    console.log('✅ Deleted all artworks');

    // Delete all categories
    await connection.query('DELETE FROM categories');
    console.log('✅ Deleted all categories');

    // Reset auto increment
    await connection.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE artworks AUTO_INCREMENT = 1');
    console.log('✅ Reset auto increment counters');

    // Insert fresh categories
    const categories = [
      { name: 'Paintings', parent_id: null, description: 'Original paintings' },
      { name: 'Traditional Arts', parent_id: null, description: 'Traditional artwork' },
      { name: 'Art Prints', parent_id: null, description: 'Art prints and reproductions' },
      { name: 'Art Books', parent_id: null, description: 'Art books and literature' },
      { name: 'Abstract', parent_id: 1, description: 'Abstract paintings' },
      { name: 'Landscape', parent_id: 1, description: 'Landscape paintings' },
      { name: 'Portrait', parent_id: 1, description: 'Portrait paintings' },
      { name: 'Still Life', parent_id: 1, description: 'Still life paintings' }
    ];

    for (const category of categories) {
      await connection.query(
        'INSERT INTO categories (name, parent_id, description) VALUES (?, ?, ?)',
        [category.name, category.parent_id, category.description]
      );
    }
    console.log('✅ Inserted fresh categories');

    // Show current categories
    const [cats] = await connection.query('SELECT id, name, parent_id FROM categories ORDER BY id');
    console.log('\n📋 Current Categories:');
    cats.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.name} ${cat.parent_id ? `(parent: ${cat.parent_id})` : ''}`);
    });

    await connection.end();
    console.log('\n🎉 Category cleanup completed successfully!');
    console.log('⚠️  Now run: node server/database/seed-data.js');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupCategories();
