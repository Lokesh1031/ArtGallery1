const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'art_gallery_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔄 Seeding database with sample data...\n');

    // Create sample artists
    const artistPassword = await bcrypt.hash('artist123', 10);
    
    const artists = [
      { email: 'sophia.martinez@artist.com', name: 'Sophia Martinez', bio: 'Contemporary artist specializing in abstract expressionism', specialization: 'Abstract Art' },
      { email: 'james.chen@artist.com', name: 'James Chen', bio: 'Landscape painter capturing the beauty of nature', specialization: 'Landscape Painting' },
      { email: 'emma.johnson@artist.com', name: 'Emma Johnson', bio: 'Portrait artist with a focus on realistic renderings', specialization: 'Portrait Art' },
      { email: 'oliver.williams@artist.com', name: 'Oliver Williams', bio: 'Modern abstract artist exploring color and form', specialization: 'Modern Abstract' },
      { email: 'isabella.brown@artist.com', name: 'Isabella Brown', bio: 'Traditional artist preserving cultural heritage', specialization: 'Traditional Art' }
    ];

    const artistIds = [];
    for (const artist of artists) {
      const [result] = await connection.query(
        `INSERT INTO users (email, password, full_name, role, status) 
         VALUES (?, ?, ?, 'artist', 'approved') 
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [artist.email, artistPassword, artist.name]
      );
      const userId = result.insertId;
      artistIds.push(userId);

      await connection.query(
        `INSERT INTO artists (user_id, bio, specialization, verified, rating) 
         VALUES (?, ?, ?, TRUE, ?) 
         ON DUPLICATE KEY UPDATE bio=VALUES(bio)`,
        [userId, artist.bio, artist.specialization, (Math.random() * 2 + 3).toFixed(2)]
      );
    }
    console.log(`✅ Created ${artists.length} sample artists`);

    // Get category IDs
    const [categories] = await connection.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Sample artworks with image URLs
    const artworks = [
      // Abstract Paintings
      {
        artistIndex: 0,
        title: 'Chromatic Dreams',
        description: 'A vibrant exploration of color theory through bold brushstrokes and dynamic composition. This piece represents the intersection of emotion and pure abstraction.',
        category: 'Abstract',
        price: 212500.00,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        materials: 'Acrylic on canvas, mixed media',
        dimensions: '36" x 48"',
        year_created: 2023,
        provenance: 'Created in the artist\'s studio, 2023. First exhibition at Modern Art Gallery.',
        bidding_enabled: true,
        current_bid: 238000.00
      },
      {
        artistIndex: 3,
        title: 'Urban Rhythm',
        description: 'Abstract representation of city life, capturing the energy and movement of urban spaces through geometric shapes and bold colors.',
        category: 'Abstract',
        price: 272000.00,
        image_url: 'https://images.unsplash.com/photo-1578926078197-f68fbb3c1b0f?w=800',
        materials: 'Oil on canvas',
        dimensions: '40" x 60"',
        year_created: 2024,
        provenance: 'Part of the Urban Series collection',
        bidding_enabled: false
      },
      {
        artistIndex: 0,
        title: 'Ethereal Whispers',
        description: 'Soft gradients and flowing forms create a dreamlike atmosphere, inviting viewers into a meditative state.',
        category: 'Abstract',
        price: 153000.00,
        image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
        materials: 'Watercolor and ink on paper',
        dimensions: '24" x 32"',
        year_created: 2023,
        provenance: 'Original artwork from the Whispers collection',
        bidding_enabled: true,
        current_bid: 165750.00
      },
      
      // Landscape Paintings
      {
        artistIndex: 1,
        title: 'Mountain Solitude',
        description: 'A breathtaking view of snow-capped peaks at dawn, capturing the serene beauty and majesty of untouched wilderness.',
        category: 'Landscape',
        price: 382500.00,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        materials: 'Oil on canvas',
        dimensions: '48" x 72"',
        year_created: 2024,
        provenance: 'Inspired by the Rocky Mountains expedition, 2024',
        bidding_enabled: true,
        current_bid: 433500.00
      },
      {
        artistIndex: 1,
        title: 'Coastal Serenity',
        description: 'The peaceful interaction of sea and shore, rendered in soft blues and warm sandy tones.',
        category: 'Landscape',
        price: 323000.00,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '36" x 54"',
        year_created: 2023,
        provenance: 'Coastal series, exhibited at Ocean View Gallery',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Autumn Forest Path',
        description: 'Golden leaves and dappled sunlight create a warm, inviting scene that celebrates the beauty of fall.',
        category: 'Landscape',
        price: 246500.00,
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        materials: 'Oil on canvas',
        dimensions: '30" x 40"',
        year_created: 2023,
        provenance: 'Seasons collection',
        bidding_enabled: true,
        current_bid: 272000.00
      },

      // Portrait Paintings
      {
        artistIndex: 2,
        title: 'The Dreamer',
        description: 'A contemplative portrait capturing the essence of introspection and quiet strength through masterful use of light and shadow.',
        category: 'Portrait',
        price: 442000.00,
        image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
        materials: 'Oil on canvas, glazing technique',
        dimensions: '24" x 30"',
        year_created: 2024,
        provenance: 'Portrait commission series',
        bidding_enabled: false
      },
      {
        artistIndex: 2,
        title: 'Wisdom and Grace',
        description: 'An elegant portrait celebrating the beauty of age and experience, rendered with careful attention to detail.',
        category: 'Portrait',
        price: 408000.00,
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        materials: 'Oil on linen',
        dimensions: '20" x 24"',
        year_created: 2023,
        provenance: 'Heritage portrait series',
        bidding_enabled: true,
        current_bid: 425000.00
      },
      {
        artistIndex: 2,
        title: 'Contemporary Soul',
        description: 'A modern take on classical portraiture, blending traditional techniques with contemporary sensibilities.',
        category: 'Portrait',
        price: 306000.00,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '18" x 24"',
        year_created: 2024,
        provenance: 'Modern portrait collection',
        bidding_enabled: false
      },

      // Traditional Arts
      {
        artistIndex: 4,
        title: 'Heritage Mandala',
        description: 'Intricate traditional mandala showcasing ancient techniques and symbolic meanings passed down through generations.',
        category: 'Traditional Arts',
        price: 187000.00,
        image_url: 'https://images.unsplash.com/photo-1582201957418-5b47083733b2?w=800',
        materials: 'Natural pigments on handmade paper',
        dimensions: '24" x 24"',
        year_created: 2023,
        provenance: 'Traditional art preservation project',
        bidding_enabled: true,
        current_bid: 208250.00
      },
      {
        artistIndex: 4,
        title: 'Cultural Tapestry',
        description: 'A stunning piece that weaves together traditional motifs and storytelling through vibrant colors and patterns.',
        category: 'Traditional Arts',
        price: 289000.00,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        materials: 'Mixed traditional media',
        dimensions: '30" x 40"',
        year_created: 2024,
        provenance: 'Cultural heritage series',
        bidding_enabled: false
      },

      // Still Life
      {
        artistIndex: 3,
        title: 'Still Life with Flowers',
        description: 'Classic still life arrangement featuring seasonal blooms rendered with contemporary color palette.',
        category: 'Still Life',
        price: 178500.00,
        image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
        materials: 'Oil on canvas',
        dimensions: '24" x 30"',
        year_created: 2023,
        provenance: 'Botanical still life series',
        bidding_enabled: true,
        current_bid: 195500.00
      },
      {
        artistIndex: 0,
        title: 'Modern Composition',
        description: 'A fresh take on still life, featuring everyday objects arranged in an abstract, contemporary style.',
        category: 'Still Life',
        price: 161500.00,
        image_url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '20" x 26"',
        year_created: 2024,
        provenance: 'Contemporary still life collection',
        bidding_enabled: false
      },

      // Additional Abstract pieces
      {
        artistIndex: 3,
        title: 'Infinite Horizons',
        description: 'A mesmerizing piece exploring the concept of infinity through layers of translucent colors and undefined boundaries.',
        category: 'Abstract',
        price: 238000.00,
        image_url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
        materials: 'Mixed media on canvas',
        dimensions: '36" x 48"',
        year_created: 2024,
        provenance: 'Horizons series',
        bidding_enabled: true,
        current_bid: 255000.00
      },
      {
        artistIndex: 0,
        title: 'Cosmic Dance',
        description: 'Swirling forms and celestial colors create a sense of movement and universal energy.',
        category: 'Abstract',
        price: 297500.00,
        image_url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
        materials: 'Acrylic and resin on canvas',
        dimensions: '42" x 54"',
        year_created: 2024,
        provenance: 'Cosmic collection',
        bidding_enabled: false
      },

      // More Landscape Paintings
      {
        artistIndex: 1,
        title: 'Desert Sunset Symphony',
        description: 'The dramatic colors of sunset over desert dunes, capturing nature\'s most spectacular light show.',
        category: 'Landscape',
        price: 357000.00,
        image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        materials: 'Oil on canvas',
        dimensions: '40" x 60"',
        year_created: 2024,
        provenance: 'Desert landscapes collection',
        bidding_enabled: true,
        current_bid: 382500.00
      },
      {
        artistIndex: 1,
        title: 'Misty Morning Valley',
        description: 'Early morning fog drifts through a peaceful valley, creating an ethereal and calming atmosphere.',
        category: 'Landscape',
        price: 280500.00,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        materials: 'Watercolor on paper',
        dimensions: '28" x 42"',
        year_created: 2023,
        provenance: 'Morning series',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Wildflower Meadow',
        description: 'A vibrant field of wildflowers swaying in the summer breeze, celebrating nature\'s colorful abundance.',
        category: 'Landscape',
        price: 229500.00,
        image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '32" x 48"',
        year_created: 2024,
        provenance: 'Botanical landscapes',
        bidding_enabled: true,
        current_bid: 250750.00
      },
      {
        artistIndex: 1,
        title: 'Winter Wonderland',
        description: 'Snow-covered pine trees stand silent in pristine winter landscape, evoking peace and stillness.',
        category: 'Landscape',
        price: 306000.00,
        image_url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
        materials: 'Oil on canvas',
        dimensions: '36" x 48"',
        year_created: 2023,
        provenance: 'Winter landscapes collection',
        bidding_enabled: false
      },

      // More Abstract Paintings
      {
        artistIndex: 3,
        title: 'Neon Dreams',
        description: 'Bold neon colors clash and merge, creating an electric atmosphere that pulses with energy.',
        category: 'Abstract',
        price: 246500.00,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        materials: 'Acrylic and fluorescent paint on canvas',
        dimensions: '36" x 36"',
        year_created: 2024,
        provenance: 'Neon series',
        bidding_enabled: true,
        current_bid: 263500.00
      },
      {
        artistIndex: 0,
        title: 'Liquid Gold',
        description: 'Metallic gold flows through abstract forms, creating a luxurious and dynamic composition.',
        category: 'Abstract',
        price: 348500.00,
        image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
        materials: 'Gold leaf and acrylic on canvas',
        dimensions: '40" x 50"',
        year_created: 2024,
        provenance: 'Metallic dreams collection',
        bidding_enabled: false
      },
      {
        artistIndex: 3,
        title: 'Geometric Harmony',
        description: 'Precise geometric shapes in harmonious colors create a sense of balance and mathematical beauty.',
        category: 'Abstract',
        price: 204000.00,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '30" x 40"',
        year_created: 2023,
        provenance: 'Geometric series',
        bidding_enabled: true,
        current_bid: 225250.00
      },
      {
        artistIndex: 0,
        title: 'Ocean Depths',
        description: 'Deep blues and teals swirl together, evoking the mystery and beauty of the ocean floor.',
        category: 'Abstract',
        price: 263500.00,
        image_url: 'https://images.unsplash.com/photo-1578926078197-f68fbb3c1b0f?w=800',
        materials: 'Mixed media with resin finish',
        dimensions: '38" x 48"',
        year_created: 2024,
        provenance: 'Aquatic abstracts',
        bidding_enabled: false
      },

      // More Portrait Paintings
      {
        artistIndex: 2,
        title: 'The Artist\'s Muse',
        description: 'A captivating portrait of an artist\'s model, rendered with soft lighting and expressive brushwork.',
        category: 'Portrait',
        price: 382500.00,
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        materials: 'Oil on linen',
        dimensions: '22" x 28"',
        year_created: 2024,
        provenance: 'Studio portraits collection',
        bidding_enabled: true,
        current_bid: 408000.00
      },
      {
        artistIndex: 2,
        title: 'Childhood Innocence',
        description: 'A tender portrait capturing the pure joy and wonder of childhood through gentle colors and soft focus.',
        category: 'Portrait',
        price: 331500.00,
        image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
        materials: 'Pastel on paper',
        dimensions: '18" x 24"',
        year_created: 2023,
        provenance: 'Family portraits series',
        bidding_enabled: false
      },
      {
        artistIndex: 2,
        title: 'The Storyteller',
        description: 'An evocative portrait of an elderly person, their face a map of life experiences and wisdom.',
        category: 'Portrait',
        price: 467500.00,
        image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800',
        materials: 'Oil on canvas',
        dimensions: '24" x 32"',
        year_created: 2024,
        provenance: 'Heritage portraits',
        bidding_enabled: true,
        current_bid: 493000.00
      },

      // More Still Life
      {
        artistIndex: 3,
        title: 'Vintage Books and Tea',
        description: 'A cozy still life arrangement featuring antique books, teacup, and reading glasses in warm lighting.',
        category: 'Still Life',
        price: 195500.00,
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
        materials: 'Oil on panel',
        dimensions: '20" x 24"',
        year_created: 2023,
        provenance: 'Literary still life series',
        bidding_enabled: true,
        current_bid: 212500.00
      },
      {
        artistIndex: 0,
        title: 'Fresh Market Bounty',
        description: 'Vibrant fruits and vegetables arranged in celebration of nature\'s abundance and color.',
        category: 'Still Life',
        price: 178500.00,
        image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '24" x 30"',
        year_created: 2024,
        provenance: 'Harvest collection',
        bidding_enabled: false
      },
      {
        artistIndex: 3,
        title: 'Morning Coffee Ritual',
        description: 'A contemporary take on classic still life, featuring coffee, pastries, and morning light.',
        category: 'Still Life',
        price: 161500.00,
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        materials: 'Oil on canvas',
        dimensions: '18" x 24"',
        year_created: 2024,
        provenance: 'Daily rituals series',
        bidding_enabled: true,
        current_bid: 174250.00
      },

      // More Traditional Arts
      {
        artistIndex: 4,
        title: 'Sacred Geometry',
        description: 'Traditional Islamic geometric patterns rendered with meticulous precision and symbolic meaning.',
        category: 'Traditional Arts',
        price: 238000.00,
        image_url: 'https://images.unsplash.com/photo-1582201957418-5b47083733b2?w=800',
        materials: 'Gold leaf and natural pigments',
        dimensions: '24" x 24"',
        year_created: 2024,
        provenance: 'Sacred art collection',
        bidding_enabled: false
      },
      {
        artistIndex: 4,
        title: 'Folk Art Celebration',
        description: 'Vibrant folk art piece featuring traditional motifs and storytelling elements from cultural heritage.',
        category: 'Traditional Arts',
        price: 212500.00,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        materials: 'Traditional tempera on wood',
        dimensions: '20" x 30"',
        year_created: 2023,
        provenance: 'Folk traditions series',
        bidding_enabled: true,
        current_bid: 229500.00
      },
      {
        artistIndex: 4,
        title: 'Ancient Calligraphy',
        description: 'Beautiful traditional calligraphy showcasing the art form\'s elegance and spiritual significance.',
        category: 'Traditional Arts',
        price: 272000.00,
        image_url: 'https://images.unsplash.com/photo-1516571748831-5d81767b788d?w=800',
        materials: 'Ink on handmade paper',
        dimensions: '18" x 36"',
        year_created: 2024,
        provenance: 'Calligraphy masters collection',
        bidding_enabled: false
      },

      // Mixed and Contemporary
      {
        artistIndex: 3,
        title: 'Urban Graffiti Art',
        description: 'Street art inspired piece bringing urban energy and contemporary culture to canvas.',
        category: 'Abstract',
        price: 221000.00,
        image_url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
        materials: 'Spray paint and acrylic on canvas',
        dimensions: '36" x 48"',
        year_created: 2024,
        provenance: 'Street art series',
        bidding_enabled: true,
        current_bid: 242250.00
      },
      {
        artistIndex: 0,
        title: 'Digital Dreams',
        description: 'Modern artwork exploring the intersection of traditional painting and digital aesthetics.',
        category: 'Abstract',
        price: 280500.00,
        image_url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
        materials: 'Mixed media with digital elements',
        dimensions: '40" x 40"',
        year_created: 2024,
        provenance: 'Digital age collection',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Tropical Paradise',
        description: 'Lush tropical landscape bursting with vibrant greens and exotic flowers, a celebration of life.',
        category: 'Landscape',
        price: 323000.00,
        image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
        materials: 'Acrylic on canvas',
        dimensions: '42" x 60"',
        year_created: 2024,
        provenance: 'Tropical series',
        bidding_enabled: true,
        current_bid: 348500.00
      },
      
      // New Indian-inspired artworks
      {
        artistIndex: 4,
        title: 'Flower Seller',
        description: 'A vibrant composition depicting a woman selling colorful flowers, rendered in bold impasto technique with rich textures and vivid colors against a pink background.',
        category: 'Traditional Arts',
        price: 295000.00,
        image_url: '/uploads/image-1769709505952-112679923.jpg',
        materials: 'Oil paint on canvas, heavy impasto',
        dimensions: '30" x 40"',
        year_created: 2024,
        provenance: 'Indian Life series',
        bidding_enabled: true,
        current_bid: 315000.00
      },
      {
        artistIndex: 4,
        title: 'Sacred Tortoise',
        description: 'Intricate black and white artwork featuring a tortoise adorned with traditional geometric patterns and tribal motifs, symbolizing wisdom and longevity.',
        category: 'Traditional Arts',
        price: 185000.00,
        image_url: '/uploads/image-1769709508950-263181021.jpg',
        materials: 'Ink on paper',
        dimensions: '20" x 28"',
        year_created: 2023,
        provenance: 'Sacred Animals collection',
        bidding_enabled: false
      },
      {
        artistIndex: 4,
        title: 'Flower Vendor at Rest',
        description: 'A contemplative portrait of a woman in traditional orange attire, sitting with her basket of vibrant flowers, captured in rich, textured brushstrokes.',
        category: 'Portrait',
        price: 325000.00,
        image_url: '/uploads/image-1769709509428-495775596.jpg',
        materials: 'Oil on canvas, impasto technique',
        dimensions: '36" x 48"',
        year_created: 2024,
        provenance: 'Working Life series',
        bidding_enabled: true,
        current_bid: 355000.00
      },
      {
        artistIndex: 4,
        title: 'The Flower Merchant',
        description: 'A joyful portrayal of an elderly man sitting beside a blue vase overflowing with colorful blooms, celebrating the simple beauty of daily life.',
        category: 'Portrait',
        price: 285000.00,
        image_url: '/uploads/image-1769709597587-166334640.jpg',
        materials: 'Acrylic on canvas, thick texture',
        dimensions: '32" x 42"',
        year_created: 2024,
        provenance: 'Street Vendors collection',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Urban Morning',
        description: 'Atmospheric watercolor depicting a bustling Indian street scene with a bus, temple architecture, and daily life unfolding in soft, luminous washes.',
        category: 'Landscape',
        price: 245000.00,
        image_url: '/uploads/image-1769709932028-802083486.jpg',
        materials: 'Watercolor on paper',
        dimensions: '22" x 30"',
        year_created: 2024,
        provenance: 'City Chronicles series',
        bidding_enabled: true,
        current_bid: 265000.00
      },
      {
        artistIndex: 4,
        title: 'Lotus Dance',
        description: 'A vibrant traditional painting featuring a joyful figure leaping among lotus flowers and traditional motifs, rich with cultural symbolism and ornate details.',
        category: 'Traditional Arts',
        price: 395000.00,
        image_url: '/uploads/image-1769710924335-988887286.jpg',
        materials: 'Traditional pigments on canvas',
        dimensions: '40" x 40"',
        year_created: 2024,
        provenance: 'Cultural Heritage collection',
        bidding_enabled: true,
        current_bid: 425000.00
      },
      {
        artistIndex: 1,
        title: 'Wildflower Meadow Dreams',
        description: 'A delicate botanical composition featuring various wildflowers and grasses in warm, golden tones with intricate details and natural beauty.',
        category: 'Still Life',
        price: 215000.00,
        image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
        materials: 'Watercolor and ink on paper',
        dimensions: '24" x 32"',
        year_created: 2023,
        provenance: 'Botanical Studies series',
        bidding_enabled: false
      },
      {
        artistIndex: 0,
        title: 'Burning Flowers-12',
        description: 'A stunning figurative artwork featuring dynamic floral elements with bold, expressive brushwork. Created by Neha Koitiya, this piece combines acrylic techniques to capture the passionate energy of burning flowers.',
        category: 'Traditional Arts',
        price: 175000.00,
        image_url: '/uploads/burning-flowers-12.jpg',
        materials: 'Acrylic on Paper',
        dimensions: '8" x 11.5"',
        year_created: 2024,
        provenance: 'Burning Flowers series by artist Neha Koitiya',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Traditional Moments',
        description: 'A captivating artwork depicting daily life with traditional motifs and vibrant colors, celebrating cultural heritage and authenticity.',
        category: 'Traditional Arts',
        price: 185000.00,
        image_url: '/uploads/artwork-084315.jpg',
        materials: 'Mixed media on canvas',
        dimensions: '20" x 24"',
        year_created: 2023,
        provenance: 'Cultural Heritage collection',
        bidding_enabled: false
      },
      {
        artistIndex: 2,
        title: 'Baazar-2',
        description: 'A vibrant depiction of a bustling marketplace, capturing the energy and colors of traditional bazaars with intricate details and dynamic composition.',
        category: 'Traditional Arts',
        price: 245000.00,
        image_url: '/uploads/baazar-2.jpg',
        materials: 'Acrylic on canvas',
        dimensions: '30" x 40"',
        year_created: 2024,
        provenance: 'Urban Life series',
        bidding_enabled: true,
        current_bid: 265000.00
      },
      {
        artistIndex: 3,
        title: 'My City-4',
        description: 'An urban landscape showcasing the modern cityscape with architectural elements and contemporary perspective, blending tradition with modernity.',
        category: 'Traditional Arts',
        price: 195000.00,
        image_url: '/uploads/my-city-4.jpg',
        materials: 'Oil on canvas',
        dimensions: '24" x 36"',
        year_created: 2024,
        provenance: 'My City series',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Abstract Expression III',
        description: 'A dynamic abstract composition featuring flowing forms and vibrant colors that evoke emotion and movement.',
        category: 'Abstract',
        price: 165000.00,
        image_url: '/uploads/artwork-3-1-2.jpg',
        materials: 'Acrylic on canvas',
        dimensions: '18" x 24"',
        year_created: 2023,
        provenance: 'Abstract Expression series',
        bidding_enabled: false
      },
      {
        artistIndex: 4,
        title: 'Contemporary Vision',
        description: 'A modern interpretation of traditional themes, merging contemporary techniques with classical motifs.',
        category: 'Traditional Arts',
        price: 225000.00,
        image_url: '/uploads/artwork-02-1.jpg',
        materials: 'Mixed media',
        dimensions: '30" x 30"',
        year_created: 2024,
        provenance: 'Vision series',
        bidding_enabled: true,
        current_bid: 245000.00
      },
      {
        artistIndex: 3,
        title: 'My City-3',
        description: 'Another captivating piece from the My City series, exploring urban landscapes with unique perspective and artistic vision.',
        category: 'Traditional Arts',
        price: 198000.00,
        image_url: '/uploads/my-city-3.jpg',
        materials: 'Watercolor and ink',
        dimensions: '22" x 34"',
        year_created: 2024,
        provenance: 'My City series',
        bidding_enabled: false
      },
      {
        artistIndex: 3,
        title: 'My City-2',
        description: 'An evocative cityscape capturing the essence of urban life with masterful use of light and shadow.',
        category: 'Traditional Arts',
        price: 192000.00,
        image_url: '/uploads/my-city-2.jpg',
        materials: 'Oil on canvas',
        dimensions: '24" x 36"',
        year_created: 2023,
        provenance: 'My City series',
        bidding_enabled: false
      },
      {
        artistIndex: 4,
        title: 'Gandhi Ashraya',
        description: 'A thoughtful tribute to Mahatma Gandhi\'s legacy, depicting the spiritual and historical significance of Gandhi Ashram with reverence and artistic depth.',
        category: 'Traditional Arts',
        price: 285000.00,
        image_url: '/uploads/gandhi-ashraya-01.jpg',
        materials: 'Traditional pigments on canvas',
        dimensions: '36" x 48"',
        year_created: 2024,
        provenance: 'Historical Landmarks collection',
        bidding_enabled: true,
        current_bid: 315000.00
      },
      {
        artistIndex: 1,
        title: 'Nature II',
        description: 'A serene landscape celebrating the beauty of natural elements with delicate brushwork and harmonious color palette.',
        category: 'Landscape',
        price: 178000.00,
        image_url: '/uploads/nature-ii.jpg',
        materials: 'Watercolor on paper',
        dimensions: '20" x 28"',
        year_created: 2023,
        provenance: 'Nature series',
        bidding_enabled: false
      },
      {
        artistIndex: 1,
        title: 'Nature I',
        description: 'The first piece in the Nature series, showcasing pristine landscapes with attention to detail and natural beauty.',
        category: 'Landscape',
        price: 175000.00,
        image_url: '/uploads/nature-i.jpg',
        materials: 'Watercolor on paper',
        dimensions: '20" x 28"',
        year_created: 2023,
        provenance: 'Nature series',
        bidding_enabled: false
      }
    ];

    let insertedCount = 0;
    for (const artwork of artworks) {
      const artistUserId = artistIds[artwork.artistIndex];
      const [artistData] = await connection.query(
        'SELECT id FROM artists WHERE user_id = ?',
        [artistUserId]
      );

      if (artistData.length > 0) {
        const categoryId = categoryMap[artwork.category];
        await connection.query(
          `INSERT INTO artworks (
            artist_id, title, description, category_id, price, image_url,
            materials, dimensions, year_created, provenance, status, is_available,
            bidding_enabled, current_bid
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', TRUE, ?, ?)`,
          [
            artistData[0].id,
            artwork.title,
            artwork.description,
            categoryId,
            artwork.price,
            artwork.image_url,
            artwork.materials,
            artwork.dimensions,
            artwork.year_created,
            artwork.provenance,
            artwork.bidding_enabled,
            artwork.current_bid || 0
          ]
        );
        insertedCount++;
      }
    }
    console.log(`✅ Created ${insertedCount} sample artworks with images`);

    // Add some sample reviews
    const customerPassword = await bcrypt.hash('customer123', 10);
    const [customerResult] = await connection.query(
      `INSERT INTO users (email, password, full_name, role, status) 
       VALUES ('customer@test.com', ?, 'John Customer', 'customer', 'approved') 
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [customerPassword]
    );
    const customerId = customerResult.insertId;
    console.log('✅ Created sample customer');

    // Add sample orders and reviews
    const [artworkIds] = await connection.query('SELECT id, artist_id, price FROM artworks LIMIT 5');
    const reviews = [
      { rating: 5, comment: 'Absolutely stunning piece! The colors are even more vibrant in person.' },
      { rating: 4, comment: 'Beautiful artwork. Great quality and fast shipping.' },
      { rating: 5, comment: 'This piece transformed my living room. Highly recommend!' },
      { rating: 5, comment: 'Exceptional craftsmanship. Worth every penny.' },
      { rating: 4, comment: 'Lovely piece, exactly as described. Very pleased with my purchase.' }
    ];

    for (let i = 0; i < artworkIds.length; i++) {
      // Create order first
      const orderNumber = `ORD-${Date.now()}-${i}`;
      const [orderResult] = await connection.query(
        `INSERT INTO orders (customer_id, artwork_id, artist_id, order_number, amount, status, payment_status) 
         VALUES (?, ?, ?, ?, ?, 'delivered', 'completed')`,
        [customerId, artworkIds[i].id, artworkIds[i].artist_id, orderNumber, artworkIds[i].price]
      );
      
      // Add review
      await connection.query(
        `INSERT INTO reviews (artwork_id, customer_id, order_id, rating, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [artworkIds[i].id, customerId, orderResult.insertId, reviews[i].rating, reviews[i].comment]
      );
    }
    console.log('✅ Added sample orders and reviews\n');

    await connection.end();
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${artists.length} Artists`);
    console.log(`   - ${insertedCount} Artworks`);
    console.log(`   - ${reviews.length} Reviews`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@artgallery.com / admin123');
    console.log('   Artist: sophia.martinez@artist.com / artist123');
    console.log('   Customer: customer@test.com / customer123');
    console.log('\n🌐 Application running at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend: http://localhost:5000\n');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();
