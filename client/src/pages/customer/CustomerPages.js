// Customer Module Pages

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

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
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>My Bids</h1>
        <p>Track your active and past bids</p>
      </div>
    </div>
  );
};

export { default as CartPage } from './CartPage';
export { default as CheckoutPage } from './CheckoutPageRazorpay';
export { default as ProfilePage } from './ProfilePage';
export { default as PaymentSuccess } from './PaymentSuccess';
export { default as PaymentFailed } from './PaymentFailed';
