import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VirtualWallPreview.css';

const VirtualWallPreview = ({ artwork, onClose }) => {
  const [wallType, setWallType] = useState('modern');
  const [artworkSize, setArtworkSize] = useState('medium');
  const [customWallColor, setCustomWallColor] = useState('#f5f5f5');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const wallColors = [
    { name: 'Pure White', color: '#ffffff', gradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' },
    { name: 'Soft Cream', color: '#f5f5dc', gradient: 'linear-gradient(135deg, #f5f5dc 0%, #ede8dc 100%)' },
    { name: 'Warm Beige', color: '#f0e6d2', gradient: 'linear-gradient(135deg, #f0e6d2 0%, #c9b8a0 100%)' },
    { name: 'Light Gray', color: '#d3d3d3', gradient: 'linear-gradient(135deg, #d3d3d3 0%, #c0c0c0 100%)' },
    { name: 'Cool Blue', color: '#e0e7f1', gradient: 'linear-gradient(135deg, #e0e7f1 0%, #c4d3e6 100%)' },
    { name: 'Soft Green', color: '#e8f5e9', gradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' },
    { name: 'Blush Pink', color: '#ffe4e1', gradient: 'linear-gradient(135deg, #ffe4e1 0%, #ffc0cb 100%)' },
    { name: 'Lavender', color: '#e6e6fa', gradient: 'linear-gradient(135deg, #e6e6fa 0%, #d8bfd8 100%)' },
    { name: 'Pale Yellow', color: '#fffacd', gradient: 'linear-gradient(135deg, #fffacd 0%, #ffeaa7 100%)' },
    { name: 'Mint Green', color: '#f0fff0', gradient: 'linear-gradient(135deg, #f0fff0 0%, #d4edda 100%)' },
    { name: 'Peach', color: '#ffdab9', gradient: 'linear-gradient(135deg, #ffdab9 0%, #ffcba4 100%)' },
    { name: 'Sky Blue', color: '#87ceeb', gradient: 'linear-gradient(135deg, #87ceeb 0%, #6bb6e3 100%)' },
    { name: 'Charcoal Gray', color: '#36454f', gradient: 'linear-gradient(135deg, #36454f 0%, #2c3539 100%)' },
    { name: 'Navy Blue', color: '#1e3a5f', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #16304d 100%)' },
    { name: 'Dark Green', color: '#2d4a2b', gradient: 'linear-gradient(135deg, #2d4a2b 0%, #1e3a1c 100%)' },
    { name: 'Rich Brown', color: '#5c4033', gradient: 'linear-gradient(135deg, #5c4033 0%, #3e2723 100%)' },
    { name: 'Deep Purple', color: '#4b0082', gradient: 'linear-gradient(135deg, #4b0082 0%, #380066 100%)' },
    { name: 'Burgundy', color: '#800020', gradient: 'linear-gradient(135deg, #800020 0%, #660018 100%)' },
    { name: 'Forest Green', color: '#228b22', gradient: 'linear-gradient(135deg, #228b22 0%, #1a6b1a 100%)' },
    { name: 'Slate Gray', color: '#708090', gradient: 'linear-gradient(135deg, #708090 0%, #5c6d7a 100%)' }
  ];
  
  const wallTypes = {
    modern: {
      name: 'Modern White',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      image: null
    },
    gallery: {
      name: 'Art Gallery',
      background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
      image: null
    },
    home: {
      name: 'Home Living Room',
      background: 'linear-gradient(135deg, #f0e6d2 0%, #c9b8a0 100%)',
      image: null
    },
    office: {
      name: 'Office Space',
      background: 'linear-gradient(135deg, #e0e7f1 0%, #c4d3e6 100%)',
      image: null
    },
    custom: {
      name: 'Custom Color',
      background: customWallColor,
      image: null
    }
  };

  const artworkSizes = {
    small: { width: '25%', label: 'Small (25%)' },
    medium: { width: '40%', label: 'Medium (40%)' },
    large: { width: '55%', label: 'Large (55%)' },
    xlarge: { width: '70%', label: 'Extra Large (70%)' }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="wall-preview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="wall-preview-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-preview-btn" onClick={onClose}>✕</button>
          
          <div className="preview-header">
            <h2>Virtual Wall Preview</h2>
            <p>See how "{artwork.title}" looks on your wall</p>
          </div>

          <div className="preview-controls">
            <div className="control-group">
              <label>Wall Type:</label>
              <div className="wall-type-buttons">
                {Object.entries(wallTypes).map(([key, wall]) => (
                  <button
                    key={key}
                    className={`wall-type-btn ${wallType === key ? 'active' : ''}`}
                    onClick={() => {
                      setWallType(key);
                      if (key === 'custom') {
                        setShowColorPicker(true);
                      }
                    }}
                  >
                    {wall.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Wall Color Picker */}
            {(wallType === 'custom' || showColorPicker) && (
              <div className="control-group color-picker-section">
                <label>Choose Wall Color:</label>
                <div className="color-palette">
                  {wallColors.map((colorOption, index) => (
                    <div
                      key={index}
                      className="color-option"
                      title={colorOption.name}
                      onClick={() => {
                        setCustomWallColor(colorOption.gradient);
                        setWallType('custom');
                      }}
                    >
                      <div 
                        className="color-swatch"
                        style={{ background: colorOption.gradient }}
                      ></div>
                      <span className="color-name">{colorOption.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="custom-color-input">
                  <label>Or enter custom color:</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={customWallColor.startsWith('#') ? customWallColor : '#f5f5f5'}
                      onChange={(e) => {
                        setCustomWallColor(e.target.value);
                        setWallType('custom');
                      }}
                      className="color-picker-input"
                    />
                    <input
                      type="text"
                      value={customWallColor}
                      onChange={(e) => {
                        setCustomWallColor(e.target.value);
                        setWallType('custom');
                      }}
                      placeholder="#ffffff or gradient"
                      className="color-text-input"
                    />
                  </div>
                </div>
                
                <button 
                  className="close-color-picker-btn"
                  onClick={() => setShowColorPicker(false)}
                >
                  Close Color Picker
                </button>
              </div>
            )}

            <div className="control-group">
              <label>Artwork Size:</label>
              <div className="size-buttons">
                {Object.entries(artworkSizes).map(([key, size]) => (
                  <button
                    key={key}
                    className={`size-btn ${artworkSize === key ? 'active' : ''}`}
                    onClick={() => setArtworkSize(key)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="wall-preview-container">
            <div 
              className="virtual-wall"
              style={{ background: wallTypes[wallType].background }}
            >
              {/* Room Elements for Depth */}
              <div className="room-floor"></div>
              
              {/* Artwork Display */}
              <motion.div
                className="preview-artwork"
                style={{ width: artworkSizes[artworkSize].width }}
                animate={{ width: artworkSizes[artworkSize].width }}
                transition={{ duration: 0.5 }}
              >
                <div className="artwork-frame">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x600/667eea/ffffff?text=Image+Not+Available';
                    }}
                    loading="eager"
                  />
                  <div className="frame-shadow"></div>
                </div>
                
                {/* Lighting Effect */}
                <div className="spotlight"></div>
              </motion.div>

              {/* Furniture for Scale Reference */}
              <div className="furniture-reference">
                {wallType === 'home' && <div className="sofa"></div>}
                {wallType === 'office' && <div className="desk"></div>}
              </div>
            </div>

            <div className="preview-info">
              <div className="info-item">
                <span className="info-label">Artwork:</span>
                <span className="info-value">{artwork.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Artist:</span>
                <span className="info-value">{artwork.artist_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Dimensions:</span>
                <span className="info-value">
                  {artwork.dimensions || 'Custom sizing available'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Price:</span>
                <span className="info-value price">${artwork.price}</span>
              </div>
            </div>
          </div>

          <div className="preview-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close Preview
            </button>
            <button className="btn-primary">
              Add to Cart
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VirtualWallPreview;
