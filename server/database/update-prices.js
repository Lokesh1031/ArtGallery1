const mysql = require('mysql2/promise');
require('dotenv').config();

const updatePrices = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'art_gallery_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database. Updating artwork prices...\n');

    const priceUpdates = [
      { title: 'Chromatic Dreams',          price: 42500.00, current_bid: 47500.00 },
      { title: 'Urban Rhythm',              price: 54500.00, current_bid: null },
      { title: 'Ethereal Whispers',         price: 30500.00, current_bid: 33000.00 },
      { title: 'Mountain Solitude',         price: 76500.00, current_bid: 86500.00 },
      { title: 'Coastal Serenity',          price: 64500.00, current_bid: null },
      { title: 'Autumn Forest Path',        price: 49000.00, current_bid: 54500.00 },
      { title: 'The Dreamer',               price: 88500.00, current_bid: null },
      { title: 'Wisdom and Grace',          price: 81500.00, current_bid: 85000.00 },
      { title: 'Contemporary Soul',         price: 61000.00, current_bid: null },
      { title: 'Heritage Mandala',          price: 37500.00, current_bid: 41500.00 },
      { title: 'Cultural Tapestry',         price: 57500.00, current_bid: null },
      { title: 'Still Life with Flowers',   price: 35500.00, current_bid: 39000.00 },
      { title: 'Modern Composition',        price: 32500.00, current_bid: null },
      { title: 'Infinite Horizons',         price: 47500.00, current_bid: 51000.00 },
      { title: 'Cosmic Dance',              price: 59500.00, current_bid: null },
      { title: 'Desert Sunset Symphony',    price: 71500.00, current_bid: 76500.00 },
      { title: 'Misty Morning Valley',      price: 56000.00, current_bid: null },
      { title: 'Wildflower Meadow',         price: 46000.00, current_bid: 50000.00 },
      { title: 'Winter Wonderland',         price: 61000.00, current_bid: null },
      { title: 'Neon Dreams',               price: 49500.00, current_bid: 52500.00 },
      { title: 'Liquid Gold',               price: 69500.00, current_bid: null },
      { title: 'Geometric Harmony',         price: 40500.00, current_bid: 45000.00 },
      { title: 'Ocean Depths',              price: 52500.00, current_bid: null },
      { title: "The Artist's Muse",         price: 76500.00, current_bid: 81500.00 },
      { title: 'Childhood Innocence',       price: 66500.00, current_bid: null },
      { title: 'The Storyteller',           price: 93500.00, current_bid: 98500.00 },
      { title: 'Vintage Books and Tea',     price: 39000.00, current_bid: 42500.00 },
      { title: 'Fresh Market Bounty',       price: 35500.00, current_bid: null },
      { title: 'Morning Coffee Ritual',     price: 32500.00, current_bid: 35000.00 },
      { title: 'Sacred Geometry',           price: 47500.00, current_bid: null },
      { title: 'Folk Art Celebration',      price: 42500.00, current_bid: 46000.00 },
      { title: 'Ancient Calligraphy',       price: 54500.00, current_bid: null },
      { title: 'Urban Graffiti Art',        price: 44000.00, current_bid: 48500.00 },
      { title: 'Digital Dreams',            price: 56000.00, current_bid: null },
      { title: 'Tropical Paradise',         price: 64500.00, current_bid: 69500.00 },
      { title: 'Flower Seller',             price: 59000.00, current_bid: 63000.00 },
      { title: 'Sacred Tortoise',           price: 37000.00, current_bid: null },
      { title: 'Flower Vendor at Rest',     price: 65000.00, current_bid: 71000.00 },
      { title: 'The Flower Merchant',       price: 57000.00, current_bid: null },
      { title: 'Urban Morning',             price: 49000.00, current_bid: 53000.00 },
      { title: 'Lotus Dance',               price: 79000.00, current_bid: 85000.00 },
      { title: 'Wildflower Meadow Dreams',  price: 43000.00, current_bid: null },
      { title: 'Burning Flowers-12',        price: 35000.00, current_bid: null },
      { title: 'Traditional Moments',       price: 37000.00, current_bid: null },
      { title: 'Baazar-2',                  price: 49000.00, current_bid: 53000.00 },
      { title: 'My City-4',                 price: 39000.00, current_bid: null },
      { title: 'Abstract Expression III',   price: 33000.00, current_bid: null },
      { title: 'Contemporary Vision',       price: 45000.00, current_bid: 49000.00 },
      { title: 'My City-3',                 price: 39500.00, current_bid: null },
      { title: 'My City-2',                 price: 38500.00, current_bid: null },
      { title: 'Gandhi Ashraya',            price: 57000.00, current_bid: 63000.00 },
      { title: 'Nature II',                 price: 35500.00, current_bid: null },
      { title: 'Nature I',                  price: 35000.00, current_bid: null },
    ];

    let updatedCount = 0;

    for (const item of priceUpdates) {
      if (item.current_bid !== null) {
        const [result] = await connection.query(
          'UPDATE artworks SET price = ?, current_bid = ? WHERE title = ?',
          [item.price, item.current_bid, item.title]
        );
        if (result.affectedRows > 0) {
          console.log(`Updated: ${item.title} -> ₹${item.price.toLocaleString('en-IN')} (bid: ₹${item.current_bid.toLocaleString('en-IN')})`);
          updatedCount += result.affectedRows;
        } else {
          console.log(`Not found: ${item.title}`);
        }
      } else {
        const [result] = await connection.query(
          'UPDATE artworks SET price = ? WHERE title = ?',
          [item.price, item.title]
        );
        if (result.affectedRows > 0) {
          console.log(`Updated: ${item.title} -> ₹${item.price.toLocaleString('en-IN')}`);
          updatedCount += result.affectedRows;
        } else {
          console.log(`Not found: ${item.title}`);
        }
      }
    }

    // Also catch any remaining artworks priced above 99999 with a proportional reduction
    const [remaining] = await connection.query(
      'SELECT id, title, price, current_bid FROM artworks WHERE price >= 100000'
    );
    if (remaining.length > 0) {
      console.log(`\nFound ${remaining.length} additional artworks still above ₹99,999. Reducing proportionally...`);
      for (const row of remaining) {
        const newPrice = Math.round(row.price / 5 / 500) * 500;
        const newBid = row.current_bid > 0 ? Math.round(row.current_bid / 5 / 500) * 500 : 0;
        await connection.query(
          'UPDATE artworks SET price = ?, current_bid = ? WHERE id = ?',
          [newPrice, newBid, row.id]
        );
        console.log(`Updated: ${row.title} -> ₹${newPrice.toLocaleString('en-IN')}`);
        updatedCount++;
      }
    }

    await connection.end();
    console.log(`\nDone! ${updatedCount} artwork(s) updated. All prices are now below ₹1,00,000.`);

  } catch (error) {
    console.error('Error updating prices:', error.message);
    process.exit(1);
  }
};

updatePrices();
