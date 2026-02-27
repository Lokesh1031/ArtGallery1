const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkArtworks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'art_gallery_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('=== CATEGORIES ===');
    const [categories] = await connection.query('SELECT id, name FROM categories');
    categories.forEach(cat => {
      console.log(`${cat.id}: ${cat.name}`);
    });

    console.log('\n=== ARTWORKS WITH /uploads/ IMAGES ===');
    const [artworks] = await connection.query(`
      SELECT a.id, a.title, a.category_id, c.name as category_name, a.image_url 
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.image_url LIKE '/uploads/%'
      ORDER BY a.id DESC
      LIMIT 15
    `);
    
    artworks.forEach(art => {
      console.log(`${art.id}: ${art.title} | Category: ${art.category_name} (ID: ${art.category_id}) | Image: ${art.image_url}`);
    });

    console.log('\n=== COUNT BY CATEGORY ===');
    const [counts] = await connection.query(`
      SELECT c.name, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN artworks a ON c.id = a.category_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);
    counts.forEach(row => {
      console.log(`${row.name}: ${row.count} artworks`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkArtworks();
