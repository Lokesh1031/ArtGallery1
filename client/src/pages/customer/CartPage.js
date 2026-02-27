import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders, deleteOrder } from '../../services/api';
import { formatPriceSplit } from '../../utils/currency';
import { motion } from 'framer-motion';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [isAuthenticated, navigate, user]);

  const fetchCartItems = async () => {
    try {
      const response = await getUserOrders(user.id);
      // Filter only pending cart items
      const cartOrders = response.data.orders.filter(
        order => order.status === 'pending' && order.shipping_address === 'To be updated'
      );
      setCartItems(cartOrders);
      
      // Initialize quantities
      const initialQuantities = {};
      cartOrders.forEach(item => {
        initialQuantities[item.id] = 1; // Default quantity is 1
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => {
      const newQty = (prev[itemId] || 1) + change;
      if (newQty < 1) return prev;
      if (newQty > 10) {
        alert('Maximum quantity is 10');
        return prev;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleRemoveItem = async (orderId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      setRemovingItemId(orderId);
      try {
        console.log('Attempting to delete order with ID:', orderId);
        console.log('Current user:', user);
        
        const response = await deleteOrder(orderId);
        console.log('Delete response:', response.data);
        
        if (response.data.success) {
          // Update cart items state
          const updatedCartItems = cartItems.filter(item => item.id !== orderId);
          setCartItems(updatedCartItems);
          
          // Update quantities state
          const newQuantities = { ...quantities };
          delete newQuantities[orderId];
          setQuantities(newQuantities);
          
          // Show success message
          alert('Item removed from cart successfully!');
        } else {
          alert('Failed to remove item. Please try again.');
        }
      } catch (error) {
        console.error('Remove item error:', error);
        console.error('Error response:', error.response);
        
        // More detailed error message
        const errorMessage = error.response?.data?.message || 
                           error.response?.statusText || 
                           'Failed to remove item. Please check your connection and try again.';
        alert(errorMessage);
      } finally {
        setRemovingItemId(null);
      }
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = quantities[item.id] || 1;
      return total + (parseFloat(item.amount) * qty);
    }, 0);
  };

  const calculateGST = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateDelivery = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 42500 ? 0 : 3400; // Free delivery above ₹42,500
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() + calculateDelivery();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    // Pass cart items with quantities to checkout
    const itemsWithQty = cartItems.map(item => ({
      ...item,
      quantity: quantities[item.id] || 1
    }));
    navigate('/checkout', { state: { cartItems: itemsWithQty } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="container">
          <h1>Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h1>
        </div>
      </div>

      <div className="container">
        {cartItems.length === 0 ? (
          <motion.div
            className="empty-cart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty!</h2>
            <p>Add items to it now.</p>
            <Link to="/gallery" className="btn-shop-now">
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items Section */}
            <div className="cart-items-section">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="cart-item-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="item-image-wrapper">
                    <img 
                      src={item.image_url} 
                      alt={item.artwork_title}
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/140x140/667eea/ffffff?text=No+Image';
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="item-info">
                    <h3 className="item-title">{item.artwork_title}</h3>
                    <p className="item-artist">by {item.artist_name}</p>
                    <p className="item-order-num">Order #{item.order_number}</p>
                    
                    <div className="item-price-section">
                      <div className="price-display">
                        <span className="current-price">
                          {formatPriceSplit(parseFloat(item.amount) * (quantities[item.id] || 1)).inr}
                        </span>
                        <span className="unit-price">
                          {formatPriceSplit(parseFloat(item.amount)).inr} each
                        </span>
                      </div>
                    </div>

                    <div className="item-actions-row">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={quantities[item.id] <= 1}
                        >
                          −
                        </button>
                        <input 
                          type="text" 
                          className="qty-input"
                          value={quantities[item.id] || 1}
                          readOnly
                        />
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          disabled={quantities[item.id] >= 10}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="btn-remove-item"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItemId === item.id}
                      >
                        {removingItemId === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price Details Section */}
            <div className="cart-summary-section">
              <div className="summary-sticky">
                <div className="summary-card">
                  <h3 className="summary-title">PRICE DETAILS</h3>
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row">
                    <span>Price ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span>{formatPriceSplit(calculateSubtotal()).inr}</span>
                  </div>

                  <div className="summary-row">
                    <span>GST (18%)</span>
                    <span>{formatPriceSplit(calculateGST()).inr}</span>
                  </div>

                  <div className="summary-row delivery-row">
                    <span>Delivery Charges</span>
                    {calculateDelivery() === 0 ? (
                      <span className="free-delivery">
                        <span className="strikethrough">₹3,400</span> FREE
                      </span>
                    ) : (
                      <span>{formatPriceSplit(calculateDelivery()).inr}</span>
                    )}
                  </div>

                  {calculateSubtotal() > 0 && calculateSubtotal() < 42500 && (
                    <div className="delivery-note">
                      <small>Add {formatPriceSplit(42500 - calculateSubtotal()).inr} more for FREE delivery</small>
                    </div>
                  )}

                  <div className="summary-divider-thick"></div>

                  <div className="summary-row total-row">
                    <span>Total Amount</span>
                    <span>{formatPriceSplit(calculateTotal()).inr}</span>
                  </div>

                  {calculateDelivery() === 0 && (
                    <div className="savings-badge">
                      You will save ₹3,400 on this order
                    </div>
                  )}

                  <button 
                    className="btn-checkout"
                    onClick={handleCheckout}
                  >
                    PLACE ORDER
                  </button>
                </div>

                <div className="secure-note">
                  <span className="secure-icon">🔒</span>
                  Safe and Secure Payments
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
