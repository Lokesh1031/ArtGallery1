// Customer Module Pages

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBids } from '../../services/api';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Customer Dashboard</h1>
        <p>Welcome, {user?.full_name}!</p>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Browse Gallery</h3>
            <a href="/gallery" className="btn btn-primary">Explore Art</a>
          </div>
          <div className="dashboard-card">
            <h3>My Orders</h3>
            <a href="/my-orders" className="btn btn-primary">View Orders</a>
          </div>
          <div className="dashboard-card">
            <h3>My Bids</h3>
            <a href="/my-bids" className="btn btn-primary">View Bids</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyOrders = () => {
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>My Orders</h1>
        <p>View your purchase history and order status</p>
      </div>
    </div>
  );
};

export const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await getUserBids(user.id);
        setBids(response.data.bids || []);
      } catch (err) {
        setError('Failed to load bids. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBids();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const map = {
      active: 'badge-info',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      outbid: 'badge-warning',
    };
    return map[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>My Bids</h1>
          <p>Loading your bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>My Bids</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>My Bids</h1>
        <p>Track your active and past bids</p>

        {bids.length === 0 ? (
          <p>You have not placed any bids yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Artwork</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Artist</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Your Bid</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {bids.map(bid => (
                  <tr key={bid.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {bid.image_url && (
                          <img
                            src={bid.image_url}
                            alt={bid.artwork_title}
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <span>{bid.artwork_title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{bid.artist_name || 'Unknown'}</td>
                    <td style={{ padding: '12px' }}>
                      ₹{parseFloat(bid.bid_amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${getStatusBadge(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(bid.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export { default as CartPage } from './CartPage';
export { default as CheckoutPage } from './CheckoutPageRazorpay';
export { default as ProfilePage } from './ProfilePage';
export { default as PaymentSuccess } from './PaymentSuccess';
export { default as PaymentFailed } from './PaymentFailed';
