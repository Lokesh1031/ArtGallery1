import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders, getUserWishlist, removeFromWishlist, addToCart } from '../../services/api';
import { formatPriceSplit } from '../../utils/currency';
import { motion } from 'framer-motion';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, account
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'orders') {
        const response = await getUserOrders(user.id);
        const confirmedOrders = response.data.orders.filter(
          order => order.status !== 'pending' || order.shipping_address !== 'To be updated'
        );
        setOrders(confirmedOrders);
      } else if (activeTab === 'wishlist') {
        const response = await getUserWishlist(user.id);
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    if (window.confirm('Remove this item from wishlist?')) {
      try {
        await removeFromWishlist(wishlistId);
        setWishlist(wishlist.filter(item => item.wishlist_id !== wishlistId));
      } catch (error) {
        alert('Failed to remove from wishlist');
      }
    }
  };

  const handleAddToCartFromWishlist = async (artworkId) => {
    try {
      await addToCart(artworkId, 'To be updated', 'pending', 'Added from wishlist');
      alert('Added to cart successfully!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#ffc107',
      shipped: '#17a2b8',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>{user?.full_name}</h1>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        <div className="profile-tabs">
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <span>📦</span> My Orders
          </button>
          <button
            className={activeTab === 'wishlist' ? 'active' : ''}
            onClick={() => setActiveTab('wishlist')}
          >
            <span>❤️</span> Wishlist
          </button>
          <button
            className={activeTab === 'account' ? 'active' : ''}
            onClick={() => setActiveTab('account')}
          >
            <span>👤</span> Account Details
          </button>
        </div>

        <div className="profile-content">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="orders-section"
            >
              <h2>My Orders ({orders.length})</h2>
              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <p>No orders yet</p>
                  <Link to="/gallery" className="btn btn-primary">Browse Gallery</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      className="order-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="order-image">
                        <img 
                          src={order.image_url} 
                          alt={order.artwork_title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/120x120/667eea/ffffff?text=No+Image';
                          }}
                          loading="lazy"
                        />
                      </div>
                      <div className="order-details">
                        <h3>{order.artwork_title}</h3>
                        <p className="order-number">Order #{order.order_number}</p>
                        <p className="order-artist">By: {order.artist_name}</p>
                        <p className="order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="order-status">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <div className="order-price">
                          <div>{formatPriceSplit(parseFloat(order.amount)).inr}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="wishlist-section"
            >
              <h2>My Wishlist ({wishlist.length})</h2>
              {loading ? (
                <div className="loading">Loading wishlist...</div>
              ) : wishlist.length === 0 ? (
                <div className="empty-state">
                  <p>Your wishlist is empty</p>
                  <Link to="/gallery" className="btn btn-primary">Browse Gallery</Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <motion.div
                      key={item.wishlist_id}
                      className="wishlist-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="wishlist-image">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=No+Image';
                          }}
                          loading="lazy"
                        />
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveFromWishlist(item.wishlist_id)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="wishlist-info">
                        <h3>{item.title}</h3>
                        <p className="wishlist-artist">{item.artist_name}</p>
                        <div className="wishlist-footer">
                          <div className="wishlist-price">
                            <div>{formatPriceSplit(parseFloat(item.price)).inr}</div>
                          </div>
                          {item.is_available ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddToCartFromWishlist(item.id)}
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <span className="sold-badge">Sold</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Account Details Tab */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="account-section"
            >
              <h2>Account Details</h2>
              <div className="account-info-grid">
                <div className="info-card">
                  <label>Full Name</label>
                  <p>{user?.full_name}</p>
                </div>
                <div className="info-card">
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                </div>
                <div className="info-card">
                  <label>Phone Number</label>
                  <p>{user?.phone || 'Not provided'}</p>
                </div>
                <div className="info-card">
                  <label>Account Type</label>
                  <p>{user?.role?.toUpperCase()}</p>
                </div>
                <div className="info-card full-width">
                  <label>Address</label>
                  <p>{user?.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="account-actions">
                <Link to="/cart" className="btn btn-secondary">View Cart</Link>
                <Link to="/gallery" className="btn btn-primary">Browse Gallery</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
