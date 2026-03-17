const mysql = require('mysql2/promise');
require('dotenv').config();

const testCommission = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'art_gallery_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🧪 Testing Commission System\n');

    // Check if commission fields exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM orders LIKE '%commission%'
    `);
    
    console.log('✅ Commission fields in orders table:');
    columns.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));
    console.log('');

    // Get sample order with commission
    const [orders] = await connection.query(`
      SELECT 
        order_number,
        amount,
        admin_commission,
        artist_payout,
        status
      FROM orders
      WHERE admin_commission IS NOT NULL AND admin_commission > 0
      LIMIT 5
    `);

    if (orders.length > 0) {
      console.log('✅ Sample orders with commission:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      orders.forEach(order => {
        const commission = parseFloat(order.admin_commission);
        const payout = parseFloat(order.artist_payout);
        const amount = parseFloat(order.amount);
        const commissionPercent = ((commission / amount) * 100).toFixed(2);
        
        console.log(`Order: ${order.order_number}`);
        console.log(`  Sale Price:     ₹${amount.toFixed(2)}`);
        console.log(`  Commission:     ₹${commission.toFixed(2)} (${commissionPercent}%)`);
        console.log(`  Artist Payout:  ₹${payout.toFixed(2)}`);
        console.log(`  Status:         ${order.status}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
    } else {
      console.log('ℹ️  No orders with commission found (this is normal if no orders exist yet)');
    }

    // Check for artworks over price limit
    const [expensiveArtworks] = await connection.query(`
      SELECT id, title, price
      FROM artworks
      WHERE price >= 100000
      LIMIT 5
    `);

    console.log('\n💰 Checking Price Cap:\n');
    if (expensiveArtworks.length > 0) {
      console.log('⚠️  Found artworks exceeding ₹5 lakh limit:');
      expensiveArtworks.forEach(art => {
        console.log(`   - "${art.title}" - ₹${parseFloat(art.price).toFixed(2)}`);
      });
      console.log('\n   These artworks should be updated or may have been added before validation.');
    } else {
      console.log('✅ All artworks are within the ₹5,00,000 price limit');
    }

    // Get total commission summary
    const [summary] = await connection.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(amount) as total_revenue,
        SUM(admin_commission) as total_commission,
        SUM(artist_payout) as total_payout
      FROM orders
      WHERE status != 'cancelled' AND admin_commission IS NOT NULL
    `);

    if (summary[0].total_orders > 0) {
      console.log('\n📊 Platform Summary:\n');
      console.log(`Total Orders:         ${summary[0].total_orders}`);
      console.log(`Total Revenue:        ₹${parseFloat(summary[0].total_revenue || 0).toFixed(2)}`);
      console.log(`Total Commission:     ₹${parseFloat(summary[0].total_commission || 0).toFixed(2)}`);
      console.log(`Total Artist Payout:  ₹${parseFloat(summary[0].total_payout || 0).toFixed(2)}`);
    }

    await connection.end();
    console.log('\n✅ Commission system test completed!\n');

  } catch (error) {
    console.error('❌ Error testing commission system:', error.message);
    process.exit(1);
  }
};

testCommission();
