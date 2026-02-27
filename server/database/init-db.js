const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Connect without database selection first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔄 Creating database...');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'art_gallery_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'art_gallery_db'}`);
    
    console.log('✅ Database created/selected');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('customer', 'artist', 'admin') NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        profile_image VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Users table created');

    // Create Artists table (extended profile for artists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        bio TEXT,
        specialization VARCHAR(255),
        portfolio_url VARCHAR(255),
        social_links JSON,
        verified BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_sales INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_verified (verified)
      )
    `);
    console.log('✅ Artists table created');

    // Create Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        parent_id INT NULL,
        description TEXT,
        image VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_parent_id (parent_id)
      )
    `);
    console.log('✅ Categories table created');

    // Create Artworks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        artist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        watermarked_image VARCHAR(255),
        wall_preview_image VARCHAR(255),
        materials TEXT,
        dimensions VARCHAR(100),
        year_created YEAR,
        provenance TEXT,
        status ENUM('pending', 'approved', 'rejected', 'sold') DEFAULT 'pending',
        is_available BOOLEAN DEFAULT TRUE,
        bidding_enabled BOOLEAN DEFAULT FALSE,
        current_bid DECIMAL(10,2) DEFAULT 0.00,
        views INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_artist_id (artist_id),
        INDEX idx_category_id (category_id),
        INDEX idx_status (status),
        INDEX idx_price (price)
      )
    `);
    console.log('✅ Artworks table created');

    // Create Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        artwork_id INT NOT NULL,
        artist_id INT NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        shipping_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_artist_id (artist_id),
        INDEX idx_order_number (order_number)
      )
    `);
    console.log('✅ Orders table created');

    // Create Bids table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id INT PRIMARY KEY AUTO_INCREMENT,
        artwork_id INT NOT NULL,
        customer_id INT NOT NULL,
        bid_amount DECIMAL(10,2) NOT NULL,
        status ENUM('active', 'accepted', 'rejected', 'outbid') DEFAULT 'active',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_artwork_id (artwork_id),
        INDEX idx_customer_id (customer_id)
      )
    `);
    console.log('✅ Bids table created');

    // Create Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        artwork_id INT NOT NULL,
        customer_id INT NOT NULL,
        order_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        artist_rating INT CHECK (artist_rating >= 1 AND artist_rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (order_id, customer_id),
        INDEX idx_artwork_id (artwork_id),
        INDEX idx_customer_id (customer_id)
      )
    `);
    console.log('✅ Reviews table created');

    // Create Messages table (for chat)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        artwork_id INT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL,
        INDEX idx_sender_id (sender_id),
        INDEX idx_receiver_id (receiver_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Messages table created');

    // Create Contact Forms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'responded') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Contact Forms table created');

    // Insert default categories
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
        'INSERT IGNORE INTO categories (name, parent_id, description) VALUES (?, ?, ?)',
        [category.name, category.parent_id, category.description]
      );
    }
    console.log('✅ Default categories inserted');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (email, password, full_name, role, status)
      VALUES ('admin@artgallery.com', ?, 'Administrator', 'admin', 'approved')
    `, [adminPassword]);
    console.log('✅ Default admin user created');
    console.log('   Email: admin@artgallery.com');
    console.log('   Password: admin123');

    await connection.end();
    console.log('\n🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
