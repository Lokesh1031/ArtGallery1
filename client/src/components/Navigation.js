import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { getUserOrders, getAllConversations } from '../services/api';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        fetchCartCount();
      }
      fetchUnreadCount();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', () => {
        fetchUnreadCount();
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket]);

  const fetchCartCount = async () => {
    try {
      const response = await getUserOrders(user.id);
      const cartItems = response.data.orders.filter(
        order => order.status === 'pending' && order.shipping_address === 'To be updated'
      );
      setCartCount(cartItems.length);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getAllConversations();
      const total = response.data.conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'artist') return '/artist-dashboard';
    if (user.role === 'customer') return '/customer-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/';
  };

  return (
    <nav className="navigation">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <h2 className="rainbow-text">Art Gallery</h2>
        </Link>

        <button 
          className="nav-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link></li>
          <li><Link to="/artists" onClick={() => setMenuOpen(false)}>Artists</Link></li>

          {isAuthenticated ? (
            <>
              <li>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              {user && user.role === 'customer' && (
                <>
                  <li className="cart-nav-item">
                    <Link to="/cart" onClick={() => setMenuOpen(false)} className="cart-link">
                      <span className="cart-icon">🛒</span>
                      <span>Cart</span>
                      {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/chat" onClick={() => setMenuOpen(false)} className="messages-link">
                  <span>Messages</span>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="btn btn-outline">Login</button>
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <button className="btn btn-primary">Register</button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
