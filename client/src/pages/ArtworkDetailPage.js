import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getArtworkById, createBid, addToCart, submitReview, addToWishlist, removeFromWishlist, checkWishlist, canReviewArtwork } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPriceSplit } from '../utils/currency';
import VirtualWallPreview from '../components/VirtualWallPreview';
import './ArtworkDetailPage.css';

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWallPreview, setShowWallPreview] = useState(false);
  const [showFullSize, setShowFullSize] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [bidAmount, setBidAmount] = useState('');
  const [review, setReview] = useState({ rating: 5, artistRating: 5, comment: '' });
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewCheckDone, setReviewCheckDone] = useState(false);

  useEffect(() => {
    fetchArtwork();
    if (isAuthenticated) {
      checkWishlistStatus();
      if (user?.role === 'customer') {
        checkReviewEligibility();
      }
    }
  }, [id, isAuthenticated]);

  // Add keyboard event listener for ESC key in full-size modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showFullSize) {
        setShowFullSize(false);
      }
    };

    if (showFullSize) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showFullSize]);

  const fetchArtwork = async () => {
    try {
      const response = await getArtworkById(id);
      setArtwork(response.data.artwork);
      setBidAmount(response.data.artwork.current_bid || response.data.artwork.price);
    } catch (error) {
      console.error('Error fetching artwork:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await checkWishlist(id);
      setInWishlist(response.data.inWishlist);
      setWishlistId(response.data.wishlistId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await canReviewArtwork(id);
      setCanReview(response.data.canReview);
      setReviewCheckDone(true);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setReviewCheckDone(true);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (inWishlist && wishlistId) {
        await removeFromWishlist(wishlistId);
        setInWishlist(false);
        setWishlistId(null);
        alert('Removed from wishlist');
      } else {
        await addToWishlist(id);
        setInWishlist(true);
        await checkWishlistStatus();
        alert('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const response = await addToCart(artwork.id, 1);
      alert('Added to cart successfully!');
      console.log('Cart response:', response.data);
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error);
      alert(error.response?.data?.message || 'Failed to add to cart. Please try again.');
    }
  };

  const handleChatWithArtist = () => {
    if (!isAuthenticated) {
      alert('Please login to chat with the artist');
      navigate('/login');
      return;
    }

    if (!artwork.artist_id) {
      alert('Artist information not available');
      return;
    }

    // Navigate to chat page with artist ID
    navigate(`/chat/${artwork.artist_id}`);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to place a bid');
      navigate('/login');
      return;
    }

    try {
      await createBid(artwork.id, bidAmount);
      alert('Bid placed successfully!');
      fetchArtwork();
    } catch (error) {
      alert('Failed to place bid');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitReview(artwork.id, review);
      setReviewSuccess(true);
      setReview({ rating: 5, artistRating: 5, comment: '' });
      setCanReview(false); // User can't review again
      
      // Hide success message after 3 seconds
      setTimeout(() => setReviewSuccess(false), 3000);
      
      // Refresh artwork to show new review
      fetchArtwork();
    } catch (error) {
      console.error('Review submission error:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!artwork) {
    return <div className="error-message">Artwork not found</div>;
  }

  return (
    <div className="artwork-detail-page">
      <div className="container">
        <motion.button
          className="back-button"
          onClick={() => navigate(-1)}
          whileHover={{ x: -5 }}
        >
          ← Back to Gallery
        </motion.button>

        <div className="artwork-detail-grid">
          {/* Artwork Images */}
          <div className="artwork-images-section">
            <motion.div
              className="main-artwork-image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x800/667eea/ffffff?text=Image+Not+Available';
                }}
                loading="eager"
              />
              {artwork.watermark_url && (
                <div className="watermark-badge">
                  <span>🔒 Watermarked Preview</span>
                </div>
              )}
            </motion.div>

            <div className="view-options">
              <button
                className="btn-view-option"
                onClick={() => setShowWallPreview(true)}
              >
                🖼️ View on Wall
              </button>
              <button 
                className="btn-view-option"
                onClick={() => setShowFullSize(true)}
              >
                🔍 View Full Size
              </button>
            </div>
          </div>

          {/* Artwork Details */}
          <div className="artwork-details-section">
            <div className="artwork-header">
              <h1>{artwork.title}</h1>
              <div className="artwork-meta">
                <span className="category-badge">{artwork.category_name}</span>
                {artwork.bidding_enabled && (
                  <span className="bidding-badge pulse">🔥 Live Bidding</span>
                )}
              </div>
            </div>

            <div className="artist-info">
              <div className="artist-avatar">
                <span>{artwork.artist_name[0]}</span>
              </div>
              <div>
                <h3>by {artwork.artist_name}</h3>
                <button
                  className="view-artist-btn"
                  onClick={() => navigate(`/artist/${artwork.artist_id}`)}
                >
                  View Artist Profile →
                </button>
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="price-label">
                  {artwork.bidding_enabled ? 'Current Bid' : 'Price'}
                </span>
                <div className="price-amounts">
                  <span className="price-amount">
                    {formatPriceSplit(artwork.bidding_enabled ? artwork.current_bid : artwork.price).inr}
                  </span>
                </div>
              </div>

              {artwork.bidding_enabled && (
                <div className="bid-info">
                  <span>Starting: {formatPriceSplit(artwork.price).inr}</span>
                  <span>•</span>
                  <span>Bids: {artwork.bid_count || 0}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {artwork.bidding_enabled ? (
                <form onSubmit={handlePlaceBid} className="bid-form">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    min={parseFloat(artwork.current_bid || artwork.price) + 1}
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Place Bid
                  </button>
                </form>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleAddToCart}>
                    🛒 Add to Cart
                  </button>
                  <button className="btn-secondary" onClick={handleChatWithArtist}>
                    💬 Chat with Artist
                  </button>
                </>
              )}
              <button 
                className={`btn-wishlist ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
              </button>
              {artwork.category_name && (artwork.category_name.toLowerCase().includes('traditional') || 
                artwork.category_name.toLowerCase().includes('madhubani') || 
                artwork.category_name.toLowerCase().includes('warli') ||
                artwork.category_name.toLowerCase().includes('gond')) && (
                <button 
                  className="btn-learn"
                  onClick={() => navigate('/gallery')}
                  title="Learn how to create this art style"
                >
                  📚 Learn This Art Style
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="details-tabs">
              <div className="tabs-header">
                <button
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  About the Art
                </button>
                <button
                  className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  Materials
                </button>
                <button
                  className={`tab-btn ${activeTab === 'provenance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('provenance')}
                >
                  Provenance
                </button>
                <button
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({artwork.review_count || 0})
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'details' && (
                  <div className="tab-panel">
                    <h3>About the Art</h3>
                    <p>{artwork.description || 'No description available.'}</p>
                    
                    <h4>Bibliography</h4>
                    <p>{artwork.bibliography || 'Not specified.'}</p>

                    <div className="artwork-specs">
                      <div className="spec-item">
                        <span className="spec-label">Dimensions:</span>
                        <span className="spec-value">{artwork.dimensions || 'Custom'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Status:</span>
                        <span className="spec-value status-available">
                          {artwork.status === 'available' ? 'Available' : 'Sold'}
                        </span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Created:</span>
                        <span className="spec-value">
                          {new Date(artwork.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="tab-panel">
                    <h3>Materials Used</h3>
                    <p>{artwork.materials || 'Materials information not provided.'}</p>
                  </div>
                )}

                {activeTab === 'provenance' && (
                  <div className="tab-panel">
                    <h3>Provenance</h3>
                    <p>{artwork.provenance || 'Provenance information not available.'}</p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="tab-panel">
                    <h3>Customer Reviews</h3>
                    
                    {isAuthenticated && user.role === 'customer' && reviewCheckDone && (
                      <>
                        {canReview ? (
                          <form onSubmit={handleSubmitReview} className="review-form">
                            <h4>Write a Review</h4>
                            
                            {reviewSuccess && (
                              <div style={{
                                background: 'rgba(76, 175, 80, 0.2)',
                                border: '1px solid rgba(76, 175, 80, 0.5)',
                                color: '#4CAF50',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                animation: 'slideIn 0.3s ease'
                              }}>
                                ✓ Review submitted successfully!
                              </div>
                            )}
                            
                            <div className="rating-input">
                              <label>Artwork Rating:</label>
                              <select
                                value={review.rating}
                                onChange={(e) => setReview({ ...review, rating: e.target.value })}
                                disabled={submittingReview}
                              >
                                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                <option value="4">⭐⭐⭐⭐ (4)</option>
                                <option value="3">⭐⭐⭐ (3)</option>
                                <option value="2">⭐⭐ (2)</option>
                                <option value="1">⭐ (1)</option>
                              </select>
                            </div>

                            <div className="rating-input">
                              <label>Artist Rating:</label>
                              <select
                                value={review.artistRating}
                                onChange={(e) => setReview({ ...review, artistRating: e.target.value })}
                                disabled={submittingReview}
                              >
                                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                <option value="4">⭐⭐⭐⭐ (4)</option>
                                <option value="3">⭐⭐⭐ (3)</option>
                                <option value="2">⭐⭐ (2)</option>
                                <option value="1">⭐ (1)</option>
                              </select>
                            </div>

                            <textarea
                              placeholder="Share your thoughts about this artwork and your experience with the artist..."
                              value={review.comment}
                              onChange={(e) => setReview({ ...review, comment: e.target.value })}
                              rows="4"
                              required
                              disabled={submittingReview}
                            />
                            <button 
                              type="submit" 
                              className="btn-primary"
                              disabled={submittingReview}
                              style={{
                                opacity: submittingReview ? 0.6 : 1,
                                cursor: submittingReview ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {submittingReview ? '⏳ Submitting...' : '✓ Submit Review'}
                            </button>
                          </form>
                        ) : (
                          <div style={{
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            color: '#FFC107',
                            padding: '15px 20px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            textAlign: 'center'
                          }}>
                            ℹ️ You can only review artworks you have purchased and received.
                          </div>
                        )}
                      </>
                    )}

                    <div className="reviews-list">
                      {artwork.reviews && artwork.reviews.length > 0 ? (
                        artwork.reviews.map((rev, idx) => (
                          <div key={idx} className="review-item">
                            <div className="review-header">
                              <div>
                                <span className="reviewer-name">{rev.user_name}</span>
                                <span className="verified-purchase-badge" 
                                      style={{
                                        marginLeft: '10px',
                                        fontSize: '0.85em',
                                        color: '#4CAF50',
                                        background: 'rgba(76, 175, 80, 0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(76, 175, 80, 0.3)'
                                      }}>
                                  ✓ Verified Purchase
                                </span>
                              </div>
                              <div className="review-ratings">
                                <span className="review-rating" title="Artwork Rating">
                                  🎨 {'⭐'.repeat(rev.rating)}
                                </span>
                                {rev.artist_rating && (
                                  <span className="review-rating" title="Artist Rating" style={{ marginLeft: '10px' }}>
                                    👨‍🎨 {'⭐'.repeat(rev.artist_rating)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="review-comment">{rev.comment}</p>
                            <span className="review-date">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Wall Preview Modal */}
      {showWallPreview && (
        <VirtualWallPreview
          artwork={artwork}
          onClose={() => setShowWallPreview(false)}
        />
      )}

      {/* Full Size Image Modal */}
      {showFullSize && (
        <motion.div 
          className="full-size-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowFullSize(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <button
            onClick={() => setShowFullSize(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10001
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            title="Close (ESC)"
          >
            ×
          </button>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              cursor: 'default',
              position: 'relative'
            }}
          >
            <img 
              src={artwork.image_url}
              alt={artwork.title}
              style={{
                maxWidth: '100%',
                maxHeight: '95vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap',
                maxWidth: '90%',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {artwork.title}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtworkDetailPage;
