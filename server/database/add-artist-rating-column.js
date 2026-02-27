const { pool } = require('../config/database');

async function addArtistRatingColumn() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🔄 Adding artist_rating column to reviews table...');

    // Check if column already exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM reviews LIKE 'artist_rating'
    `);

    if (columns.length > 0) {
      console.log('✅ Column artist_rating already exists');
      return;
    }

    // Add the artist_rating column
    await connection.query(`
      ALTER TABLE reviews 
      ADD COLUMN artist_rating INT CHECK (artist_rating >= 1 AND artist_rating <= 5)
      AFTER rating
    `);

    console.log('✅ Successfully added artist_rating column to reviews table');

  } catch (error) {
    console.error('❌ Error adding artist_rating column:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  addArtistRatingColumn()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addArtistRatingColumn };
