import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllArtworks, getAllCategories, addToWishlist, removeFromWishlist, checkWishlist, createOrder } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPriceSplit } from '../utils/currency';
import './GalleryPage.css';
import './GalleryPage_responsive.css';

const GalleryPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(true);
  const [wishlistItems, setWishlistItems] = useState({});
  const [learningMode, setLearningMode] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Drawing canvas states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawingTool, setDrawingTool] = useState('brush'); // brush, eraser, fill
  const [canvasBackground, setCanvasBackground] = useState('#FFFFFF');

  // Vertical navigation menu structure
  const navigationMenu = {
    'Art Collections': {
      icon: '🎨',
      subcategories: ['Paintings', 'Traditional Arts', 'Art Prints', 'Art Books', 'Others']
    },
    'Learn Art': {
      icon: '📚',
      subcategories: ['Madhubani Tutorial', 'Warli Art Guide', 'Gond Art Basics', 'Painting Techniques', 'Traditional Arts', 'Abstract Art']
    },
    'Artists': {
      icon: '👨‍🎨',
      subcategories: ['Featured Artists', 'Emerging Artists', 'Artist Corner']
    },
    'Categories': {
      icon: '📁',
      subcategories: ['Modern', 'Abstract', 'Landscape', 'Portrait', 'Still Life', 'Digital Art']
    }
  };

  const [expandedMenus, setExpandedMenus] = useState({
    'Art Collections': true,
    'Learn Art': false,
    'Artists': false,
    'Categories': false
  });

  // Learning tutorials data
  const learningTutorials = {
    'Madhubani Tutorial': {
      title: 'Learn Madhubani Art',
      description: 'Madhubani painting is a traditional Indian art form from Bihar. Learn the basic techniques of this beautiful folk art.',
      steps: [
        'Start with simple line drawings using natural borders',
        'Fill with intricate patterns and geometric designs',
        'Use natural colors derived from plants and minerals',
        'Focus on themes from nature, mythology, and daily life'
      ],
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      materials: ['Natural colors/Acrylic paints', 'Cardboard/Paper/Canvas', 'Fine brushes', 'Pencil for sketching', 'Painting palette'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    },
    'Warli Art Guide': {
      title: 'Master Warli Art',
      description: 'Warli is a tribal art from Maharashtra. Learn this ancient painting style using basic geometric shapes.',
      steps: [
        'Use circles, triangles, and lines as basic elements',
        'Create human figures with two triangles and a circle',
        'Draw scenes of daily life, festivals, and nature',
        'Use white pigment on mud-colored background'
      ],
      difficulty: 'Beginner',
      duration: '1-2 hours',
      materials: ['White paint/chalk', 'Brown cardboard/paper', 'Thin brush', 'Pencil', 'Painting supplies'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    },
    'Gond Art Basics': {
      title: 'Gond Art Fundamentals',
      description: 'Gond art is a tribal art form from Madhya Pradesh. Learn to create vibrant patterns and dots.',
      steps: [
        'Start with outline of animals or nature elements',
        'Fill with dots, dashes, and fine lines',
        'Use bright colors and intricate patterns',
        'Create texture with repetitive patterns'
      ],
      difficulty: 'Intermediate',
      duration: '3-4 hours',
      materials: ['Acrylic/Poster paints', 'Cardboard/Canvas', 'Fine brushes', 'Dotting tools', 'Painting palette'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    },
    'Painting Techniques': {
      title: 'Basic Painting Techniques',
      description: 'Learn fundamental painting techniques applicable to various art forms.',
      steps: [
        'Understand color theory and mixing',
        'Practice brush strokes and techniques',
        'Learn shading and highlighting',
        'Experiment with textures and layers'
      ],
      difficulty: 'Beginner',
      duration: '2-3 hours',
      materials: ['Acrylic/Oil/Watercolor paints', 'Cardboard/Canvas/Paper', 'Various painting brushes', 'Painting palette', 'Water cup'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    },
    'Traditional Arts': {
      title: 'Traditional Indian Arts',
      description: 'Explore various traditional Indian art forms and their unique characteristics.',
      steps: [
        'Study different regional art styles',
        'Understand cultural significance of each form',
        'Practice basic elements from each style',
        'Create fusion art combining techniques'
      ],
      difficulty: 'Intermediate',
      duration: '4-6 hours',
      materials: ['Various paints (Acrylic/Poster)', 'Cardboard/Paper/Canvas', 'Painting brushes', 'Reference images', 'Painting palette'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    },
    'Abstract Art': {
      title: 'Abstract Art Techniques',
      description: 'Learn to create expressive abstract art using colors, shapes, and emotions.',
      steps: [
        'Start with color palette selection',
        'Use spontaneous brush strokes and gestures',
        'Layer colors and create depth',
        'Balance composition with contrast and harmony'
      ],
      difficulty: 'Beginner',
      duration: '2-3 hours',
      materials: ['Acrylic/Poster paints', 'Cardboard/Canvas', 'Palette knife', 'Various painting brushes', 'Painting palette'],
      videoUrl: 'https://www.youtube.com/watch?v=example'
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && artworks.length > 0) {
      checkWishlistStatus();
    }
  }, [artworks, isAuthenticated]);

  const fetchData = async () => {
    try {
      console.log('📡 Fetching artworks with filters:', filters);
      const [artworksRes, categoriesRes] = await Promise.all([
        getAllArtworks(filters),
        getAllCategories()
      ]);
      console.log('✅ Artworks Response:', artworksRes.data);
      console.log('📊 Artworks count:', artworksRes.data.artworks?.length);
      console.log('🎨 First 3 artworks:', artworksRes.data.artworks?.slice(0, 3));
      console.log('📁 Categories loaded:', categoriesRes.data.categories);
      setArtworks(artworksRes.data.artworks || []);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      console.error('❌ Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const wishlistStatus = {};
      await Promise.all(
        artworks.map(async (artwork) => {
          try {
            const response = await checkWishlist(artwork.id);
            wishlistStatus[artwork.id] = response.data.inWishlist;
          } catch (error) {
            wishlistStatus[artwork.id] = false;
          }
        })
      );
      setWishlistItems(wishlistStatus);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async (e, artwork) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!artwork.is_available) {
      alert('This artwork is no longer available');
      return;
    }

    try {
      await createOrder({
        artwork_id: artwork.id,
        shipping_address: 'To be updated',
        payment_method: 'pending',
        notes: 'Cart item'
      });
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert(error.response?.data?.message || 'Failed to add to cart. Please try again.');
    }
  };

  const handleWishlistToggle = async (e, artworkId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      if (wishlistItems[artworkId]) {
        const response = await checkWishlist(artworkId);
        if (response.data.wishlistId) {
          await removeFromWishlist(response.data.wishlistId);
          setWishlistItems({ ...wishlistItems, [artworkId]: false });
        }
      } else {
        await addToWishlist(artworkId);
        setWishlistItems({ ...wishlistItems, [artworkId]: true });
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const filterBySubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setLoading(true); // Show loading when filtering
    console.log('🔍 Filtering by subcategory:', subcategory);
    
    // Check if it's a learning tutorial
    if (learningTutorials[subcategory]) {
      setLearningMode(true);
      setSelectedTutorial(subcategory);
      setLoading(false);
      return;
    }
    
    // Exit learning mode if switching to other categories
    setLearningMode(false);
    setSelectedTutorial(null);
    
    // Map navigation subcategories to database category names
    const categoryMapping = {
      'Paintings': 'Paintings',
      'Traditional Arts': 'Traditional Arts',
      'Art Prints': 'Art Prints',
      'Art Books': 'Art Books',
      'Others': '',
      'Abstract': 'Abstract',
      'Landscape': 'Landscape',
      'Portrait': 'Portrait',
      'Still Life': 'Still Life',
      'Digital Art': 'Digital Art',
      'Modern': 'Abstract' // Map Modern to Abstract for now
    };
    
    // For Artist-based filters (Featured Artists, etc.), we'll use search
    if (['Featured Artists', 'Emerging Artists', 'Artist Corner'].includes(subcategory)) {
      setFilters({ ...filters, search: '', category: '' });
      console.log('👨‍🎨 Artist filter selected - showing all artworks');
      return;
    }
    
    const categoryName = categoryMapping[subcategory];
    if (categoryName) {
      const cat = categories.find(c => c.name === categoryName);
      console.log('🎯 Found category:', cat);
      if (cat) {
        setFilters({ ...filters, category: cat.id, search: '' });
      } else {
        console.log('⚠️ Category not found for:', categoryName);
      }
    } else if (subcategory === 'Others') {
      // Show all for "Others"
      console.log('📦 Showing all for "Others"');
      setFilters({ ...filters, category: '', search: '' });
    }
  };

  // Canvas drawing functions
  useEffect(() => {
    if (learningMode && canvasRef.current) {
      initializeCanvas();
    }
  }, [learningMode, canvasBackground]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (drawingTool === 'brush') {
      ctx.strokeStyle = brushColor;
      ctx.globalCompositeOperation = 'source-over';
    } else if (drawingTool === 'eraser') {
      ctx.strokeStyle = canvasBackground;
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const changeBackground = (color) => {
    setCanvasBackground(color);
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="gallery-page">
      <div className="gallery-layout">
        {/* Vertical Navigation Menu */}
        <motion.aside 
          className={`vertical-navigation ${menuOpen ? 'open' : 'closed'}`}
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="nav-header">
            <h3>Browse Gallery</h3>
            <button 
              className="nav-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Show All Button */}
          <div className="nav-menu-list">
            <button
              className={`nav-show-all ${selectedSubcategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedSubcategory('all');
                setFilters({ category: '', minPrice: '', maxPrice: '', search: '' });
              }}
              style={{
                width: '100%',
                padding: '15px 20px',
                background: selectedSubcategory === 'all' ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              🏠 Show All Artworks
            </button>
          </div>

          <div className="nav-menu-list">
            {Object.entries(navigationMenu).map(([menuName, { icon, subcategories }]) => (
              <div key={menuName} className="nav-menu-item">
                <button 
                  className={`nav-menu-title ${expandedMenus[menuName] ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(menuName)}
                >
                  <span className="menu-icon">{icon}</span>
                  <span className="menu-name">{menuName}</span>
                  <span className="menu-arrow">{expandedMenus[menuName] ? '▼' : '▶'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedMenus[menuName] && (
                    <motion.ul 
                      className="nav-submenu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {subcategories.map((sub, idx) => (
                        <motion.li 
                          key={sub}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <button
                            className={`nav-submenu-item ${selectedSubcategory === sub ? 'active' : ''}`}
                            onClick={() => filterBySubcategory(sub)}
                          >
                            {sub}
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className={`gallery-content ${menuOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="container">
            <div className="gallery-header">
              <h1>Art Gallery Collection</h1>
              <p className="subtitle">
                {selectedSubcategory !== 'all' 
                  ? `Showing: ${selectedSubcategory} (${artworks.length} artworks)` 
                  : `Explore all artworks (${artworks.length} total)`}
              </p>
            </div>
            
        <div className="filters">
          <input
            type="text"
            placeholder="Search artworks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="search-input"
          />
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="filter-input"
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="filter-input"
          />
          
          {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setFilters({ category: '', minPrice: '', maxPrice: '', search: '' });
                setSelectedSubcategory('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {artworks.length === 0 && !loading && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            margin: '20px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '24px' }}>
              😔 No artworks found
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              Try adjusting your filters or browse all artworks
            </p>
            <button
              onClick={() => {
                setFilters({ category: '', minPrice: '', maxPrice: '', search: '' });
                setSelectedSubcategory('all');
              }}
              style={{
                padding: '12px 30px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Show All Artworks
            </button>
          </div>
        )}

        {/* Learning Tutorial Panel */}
        {learningMode && selectedTutorial && learningTutorials[selectedTutorial] && (
          <motion.div 
            className="learning-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="learning-header">
              <h2>📚 {learningTutorials[selectedTutorial].title}</h2>
              <button 
                className="close-learning-btn"
                onClick={() => {
                  setLearningMode(false);
                  setSelectedTutorial(null);
                  setSelectedSubcategory('all');
                }}
              >
                ✖ Back to Gallery
              </button>
            </div>
            
            <div className="learning-content">
              <div className="learning-intro">
                <p className="learning-description">{learningTutorials[selectedTutorial].description}</p>
                <div className="learning-meta">
                  <span className="difficulty-badge">{learningTutorials[selectedTutorial].difficulty}</span>
                  <span className="duration-badge">⏱️ {learningTutorials[selectedTutorial].duration}</span>
                </div>
              </div>

              <div className="learning-section">
                <h3>🎯 Steps to Learn</h3>
                <ol className="learning-steps">
                  {learningTutorials[selectedTutorial].steps.map((step, idx) => (
                    <li key={idx} className="learning-step">
                      <span className="step-number">{idx + 1}</span>
                      <span className="step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="learning-section">
                <h3>🎨 Materials Needed</h3>
                <ul className="materials-list">
                  {learningTutorials[selectedTutorial].materials.map((material, idx) => (
                    <li key={idx} className="material-item">
                      <span className="material-bullet">•</span>
                      <span className="material-text">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Drawing Canvas */}
              <div className="learning-section drawing-section">
                <h3>🖼️ Practice Drawing Here</h3>
                <p className="section-note">Use the tools below to practice {learningTutorials[selectedTutorial].title} directly in your browser!</p>
                
                <div className="drawing-studio">
                  {/* Drawing Tools Panel */}
                  <div className="drawing-tools">
                    <div className="tool-group">
                      <label>🖌️ Drawing Tool:</label>
                      <div className="tool-buttons">
                        <button 
                          className={`tool-btn ${drawingTool === 'brush' ? 'active' : ''}`}
                          onClick={() => setDrawingTool('brush')}
                          title="Brush"
                        >
                          🖌️ Brush
                        </button>
                        <button 
                          className={`tool-btn ${drawingTool === 'eraser' ? 'active' : ''}`}
                          onClick={() => setDrawingTool('eraser')}
                          title="Eraser"
                        >
                          ⬜ Eraser
                        </button>
                      </div>
                    </div>

                    <div className="tool-group">
                      <label>🎨 Brush Color:</label>
                      <div className="color-picker-group">
                        <input 
                          type="color" 
                          value={brushColor} 
                          onChange={(e) => setBrushColor(e.target.value)}
                          className="color-input"
                        />
                        <div className="preset-colors">
                          {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                            <button
                              key={color}
                              className="color-preset"
                              style={{ background: color }}
                              onClick={() => setBrushColor(color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="tool-group">
                      <label>🖍 Canvas Background:</label>
                      <div className="preset-colors">
                        {['#FFFFFF', '#FFF8DC', '#F5DEB3', '#D2B48C', '#000000', '#1a1a2e'].map(color => (
                          <button
                            key={color}
                            className="color-preset"
                            style={{ background: color }}
                            onClick={() => changeBackground(color)}
                            title={color === '#FFF8DC' ? 'Paper' : color === '#F5DEB3' ? 'Cardboard' : color === '#D2B48C' ? 'Wood' : 'Color'}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="tool-group">
                      <label>🖊️ Brush Size: {brushSize}px</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(e.target.value)}
                        className="brush-size-slider"
                      />
                    </div>

                    <div className="tool-group">
                      <div className="canvas-actions">
                        <button className="action-btn clear-btn" onClick={clearCanvas}>
                          🗑️ Clear Canvas
                        </button>
                        <button className="action-btn save-btn" onClick={downloadDrawing}>
                          💾 Save Drawing
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drawing Canvas */}
                  <div className="canvas-container">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="drawing-canvas"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                </div>
              </div>

              <div className="learning-section">
                <h3>📺 Video Tutorial</h3>
                <div className="video-placeholder">
                  <p>Video tutorial coming soon!</p>
                  <p className="video-note">In the meantime, search for "{learningTutorials[selectedTutorial].title}" tutorials on YouTube.</p>
                </div>
              </div>

              <div className="learning-section related-artworks">
                <h3>🎨 Related Artworks to Practice</h3>
                <p className="section-note">Browse these artworks to see examples and get inspiration:</p>
                <div className="artworks-grid-small">
                  {artworks
                    .filter(art => 
                      art.category_name?.toLowerCase().includes(selectedTutorial.toLowerCase().split(' ')[0].toLowerCase()) ||
                      art.title?.toLowerCase().includes(selectedTutorial.toLowerCase().split(' ')[0].toLowerCase())
                    )
                    .slice(0, 6)
                    .map(artwork => (
                      <Link to={`/artwork/${artwork.id}`} key={artwork.id} className="artwork-card-small">
                        <img src={artwork.image_url} alt={artwork.title} />
                        <p className="artwork-title-small">{artwork.title}</p>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Artworks Grid */}
        {!learningMode && (
        <div className="artworks-grid">
          {artworks.map(artwork => (
            <Link to={`/artwork/${artwork.id}`} key={artwork.id} className="artwork-card">
              <div className="artwork-image">
                <img 
                  src={artwork.image_url} 
                  alt={artwork.title}
                  onLoad={(e) => {
                    console.log('✅ Image loaded:', artwork.title, artwork.image_url);
                    e.target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    console.error('❌ Image failed:', artwork.title, artwork.image_url);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=Image+Not+Available';
                  }}
                  style={{ opacity: 1, background: '#f0f0f0' }}
                />
                <button
                  className={`wishlist-btn ${wishlistItems[artwork.id] ? 'active' : ''}`}
                  onClick={(e) => handleWishlistToggle(e, artwork.id)}
                  title={wishlistItems[artwork.id] ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlistItems[artwork.id] ? '❤️' : '🤍'}
                </button>
                <div className="artwork-overlay">
                  <span className="view-details">View Details</span>
                </div>
              </div>
              <div className="artwork-info">
                <h3>{artwork.title}</h3>
                <p className="artist-name">by {artwork.artist_name}</p>
                <p className="artwork-category">{artwork.category_name}</p>
                <div className="artwork-footer">
                  <div className="price-wrapper">
                    <span className="price">{formatPriceSplit(artwork.price).inr}</span>
                  </div>
                  <div className="rating-wrapper">
                    <span className="rating">⭐ {parseFloat(artwork.rating || 0).toFixed(1)}</span>
                    <span className="review-count">({artwork.review_count || 0} reviews)</span>
                  </div>
                </div>
                <div className="badges-row">
                  {artwork.bidding_enabled && (
                    <span className="bidding-badge">🔥 Live Bidding</span>
                  )}
                  {artwork.category_name && artwork.category_name.toLowerCase().includes('traditional') && (
                    <span className="learn-badge" title="Tutorial available">📚 Learn This Art</span>
                  )}
                </div>
                {!artwork.bidding_enabled && (
                  <button 
                    className="quick-add-btn"
                    onClick={(e) => handleAddToCart(e, artwork)}
                    title="Add to cart"
                  >
                    🛒 Add to Cart
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
        )}

        {!learningMode && artworks.length === 0 && (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>No artworks found matching your criteria.</p>
            <p className="no-results-hint">Try adjusting your filters or browse all categories.</p>
          </motion.div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
