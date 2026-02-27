import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getArtistSales } from '../../services/api';
import { motion } from 'framer-motion';
import './ArtistSales.css';

const ArtistSales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, confirmed, shipped, delivered
  const { user } = useAuth();

  useEffect(() => {
    fetchSales();
  }, [user]);

  const fetchSales = async () => {
    try {
      const response = await getArtistSales(user.id);
      // Filter out cart items - only show confirmed orders
      const confirmedSales = response.data.orders.filter(
        order => order.status !== 'pending' || order.shipping_address !== 'To be updated'
      );
      setSales(confirmedSales);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    return sale.status === filter;
  });

  const calculateTotalEarnings = () => {
    if (summary) {
      return sales
        .filter(sale => sale.status !== 'cancelled')
        .reduce((total, sale) => total + parseFloat(sale.artist_payout || sale.amount), 0);
    }
    return sales
      .filter(sale => sale.status !== 'cancelled')
      .reduce((total, sale) => total + parseFloat(sale.artist_payout || sale.amount * 0.95), 0);
  };

  const calculatePendingEarnings = () => {
    return sales
      .filter(sale => sale.status === 'confirmed')
      .reduce((total, sale) => total + parseFloat(sale.artist_payout || sale.amount * 0.95), 0);
  };

  const calculateTotalCommission = () => {
    return sales
      .filter(sale => sale.status !== 'cancelled')
      .reduce((total, sale) => total + parseFloat(sale.admin_commission || sale.amount * 0.05), 0);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: { bg: '#fff3cd', color: '#856404', text: 'Confirmed' },
      shipped: { bg: '#d1ecf1', color: '#0c5460', text: 'Shipped' },
      delivered: { bg: '#d4edda', color: '#155724', text: 'Delivered' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled' }
    };
    const style = statusStyles[status] || statusStyles.confirmed;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === 'completed') {
      return (
        <span style={{
          background: '#d4edda',
          color: '#155724',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          ✓ Paid
        </span>
      );
    }
    return (
      <span style={{
        background: '#fff3cd',
        color: '#856404',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="artist-sales-page">
        <div className="container">
          <div className="loading">Loading sales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-sales-page">
      <div className="container">
        <h1>My Sales & Earnings</h1>
        
        {/* Earnings Summary */}
        <div className="earnings-summary">
          <motion.div 
            className="earning-card total"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="earning-icon">💰</div>
            <div className="earning-info">
              <div className="earning-label">Your Earnings (After Commission)</div>
              <div className="earning-amount">₹{calculateTotalEarnings().toFixed(2)}</div>
            </div>
          </motion.div>

          <motion.div 
            className="earning-card pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="earning-icon">⏳</div>
            <div className="earning-info">
              <div className="earning-label">Pending Payment</div>
              <div className="earning-amount">₹{calculatePendingEarnings().toFixed(2)}</div>
            </div>
          </motion.div>

          <motion.div 
            className="earning-card commission"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="earning-icon">🏦</div>
            <div className="earning-info">
              <div className="earning-label">Platform Commission (5%)</div>
              <div className="earning-amount">₹{calculateTotalCommission().toFixed(2)}</div>
            </div>
          </motion.div>

          <motion.div 
            className="earning-card count"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="earning-icon">📦</div>
            <div className="earning-info">
              <div className="earning-label">Total Sales</div>
              <div className="earning-amount">{sales.filter(s => s.status !== 'cancelled').length}</div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Orders ({sales.length})
          </button>
          <button 
            className={filter === 'confirmed' ? 'active' : ''} 
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({sales.filter(s => s.status === 'confirmed').length})
          </button>
          <button 
            className={filter === 'shipped' ? 'active' : ''} 
            onClick={() => setFilter('shipped')}
          >
            Shipped ({sales.filter(s => s.status === 'shipped').length})
          </button>
          <button 
            className={filter === 'delivered' ? 'active' : ''} 
            onClick={() => setFilter('delivered')}
          >
            Delivered ({sales.filter(s => s.status === 'delivered').length})
          </button>
        </div>

        {/* Sales List */}
        {filteredSales.length === 0 ? (
          <div className="no-sales">
            <p>No sales found for this filter.</p>
          </div>
        ) : (
          <div className="sales-list">
            {filteredSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                className="sale-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="sale-image">
                  <img 
                    src={sale.image_url || '/placeholder-art.jpg'} 
                    alt={sale.artwork_title}
                  />
                </div>
                
                <div className="sale-details">
                  <h3>{sale.artwork_title}</h3>
                  <p className="order-number">Order #{sale.order_number}</p>
                  <p className="customer-name">👤 Customer: {sale.customer_name}</p>
                  <div className="sale-meta">
                    {getStatusBadge(sale.status)}
                    {getPaymentBadge(sale.payment_status)}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="payment-section">
                    <strong>Payment Information</strong>
                    <p>💳 Method: {sale.payment_method || 'Not specified'}</p>
                    <p>💵 Sale Price: <span className="amount-highlight">₹{parseFloat(sale.amount).toFixed(2)}</span></p>
                    <p>🏦 Platform Fee (5%): <span className="commission-text">-₹{parseFloat(sale.admin_commission || sale.amount * 0.05).toFixed(2)}</span></p>
                    <p>✨ Your Earnings: <span className="payout-highlight">₹{parseFloat(sale.artist_payout || sale.amount * 0.95).toFixed(2)}</span></p>
                    <p>📅 Date: {new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  {sale.shipping_address && sale.shipping_address !== 'To be updated' && (
                    <div className="shipping-section">
                      <strong>Shipping Address</strong>
                      <p className="address-text">{sale.shipping_address}</p>
                    </div>
                  )}

                  {sale.notes && (
                    <div className="notes-section">
                      <strong>Notes</strong>
                      <p>{sale.notes}</p>
                    </div>
                  )}
                </div>

                <div className="sale-actions">
                  <div className="sale-price">₹{parseFloat(sale.artist_payout || sale.amount * 0.95).toFixed(2)}</div>
                  <div className="sale-price-label">Your Earnings</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistSales;
