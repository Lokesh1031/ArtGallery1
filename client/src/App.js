import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GalleryPage from './pages/GalleryPage';
import InfoPages from './pages/InfoPages';
import { ArtworkDetailPage, ArtistProfilePage, ArtistsPage, ChatPage, NotFoundPage } from './pages/SharedPages';

// Artist Pages
import { ArtistDashboard, UploadArtwork, MyArtworks } from './pages/artist/ArtistPages';
import ArtistSales from './pages/artist/ArtistSales';
import ArtistUpiSetup from './pages/artist/ArtistUpiSetup';

// Customer Pages
import { CustomerDashboard, MyOrders, MyBids, CartPage, ProfilePage, PaymentSuccess, PaymentFailed } from './pages/customer/CustomerPages';
import CheckoutPageUPI from './pages/customer/CheckoutPageUPI';
import QRPaymentPage from './pages/customer/QRPaymentPage';

// Admin Pages
import { AdminDashboard, ManageArtists, ManageArtworks, ManageUsers, ContactForms } from './pages/admin/AdminPages';
import AdminPaymentVerification from './pages/admin/AdminPaymentVerification';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';

import './App.css';
import './GlobalImageStyles.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artist/:id" element={<ArtistProfilePage />} />

              {/* Artist Routes */}
              <Route path="/artist-dashboard" element={
                <PrivateRoute role="artist">
                  <ArtistDashboard />
                </PrivateRoute>
              } />
              <Route path="/upload-artwork" element={
                <PrivateRoute role="artist">
                  <UploadArtwork />
                </PrivateRoute>
              } />
              <Route path="/my-artworks" element={
                <PrivateRoute role="artist">
                  <MyArtworks />
                </PrivateRoute>
              } />
              <Route path="/my-sales" element={
                <PrivateRoute role="artist">
                  <ArtistSales />
                </PrivateRoute>
              } />
              <Route path="/artist/upi-setup" element={
                <PrivateRoute role="artist">
                  <ArtistUpiSetup />
                </PrivateRoute>
              } />

              {/* Customer Routes */}
              <Route path="/customer-dashboard" element={
                <PrivateRoute role="customer">
                  <CustomerDashboard />
                </PrivateRoute>
              } />
              <Route path="/my-orders" element={
                <PrivateRoute role="customer">
                  <MyOrders />
                </PrivateRoute>
              } />
              <Route path="/my-bids" element={
                <PrivateRoute role="customer">
                  <MyBids />
                </PrivateRoute>
              } />
              <Route path="/cart" element={
                <PrivateRoute role="customer">
                  <CartPage />
                </PrivateRoute>
              } />
              <Route path="/checkout" element={
                <PrivateRoute role="customer">
                  <CheckoutPageUPI />
                </PrivateRoute>
              } />
              <Route path="/qr-payment" element={
                <PrivateRoute role="customer">
                  <QRPaymentPage />
                </PrivateRoute>
              } />
              <Route path="/payment-success" element={
                <PrivateRoute role="customer">
                  <PaymentSuccess />
                </PrivateRoute>
              } />
              <Route path="/payment-failed" element={
                <PrivateRoute role="customer">
                  <PaymentFailed />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute role="customer">
                  <ProfilePage />
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/artists" element={
                <PrivateRoute role="admin">
                  <ManageArtists />
                </PrivateRoute>
              } />
              <Route path="/admin/artworks" element={
                <PrivateRoute role="admin">
                  <ManageArtworks />
                </PrivateRoute>
              } />
              <Route path="/admin/users" element={
                <PrivateRoute role="admin">
                  <ManageUsers />
                </PrivateRoute>
              } />
              <Route path="/admin/contacts" element={
                <PrivateRoute role="admin">
                  <ContactForms />
                </PrivateRoute>
              } />
              <Route path="/admin/payments" element={
                <PrivateRoute role="admin">
                  <AdminPaymentVerification />
                </PrivateRoute>
              } />

              {/* Shared Protected Routes */}
              <Route path="/chat" element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } />
              <Route path="/chat/:userId" element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />

              {/* Information Pages */}
              <Route path="/faq" element={<InfoPages />} />
              <Route path="/shipping" element={<InfoPages />} />
              <Route path="/packaging" element={<InfoPages />} />
              <Route path="/corporate" element={<InfoPages />} />
              <Route path="/returns" element={<InfoPages />} />
              <Route path="/help" element={<InfoPages />} />
              <Route path="/track" element={<InfoPages />} />
              <Route path="/why-sell" element={<InfoPages />} />
              <Route path="/artist-faq" element={<InfoPages />} />
              <Route path="/shows" element={<InfoPages />} />
              <Route path="/about" element={<InfoPages />} />
              <Route path="/press" element={<InfoPages />} />
              <Route path="/careers" element={<InfoPages />} />
              <Route path="/contact" element={<HomePage />} />
              <Route path="/terms" element={<InfoPages />} />
              <Route path="/privacy" element={<InfoPages />} />
              <Route path="/environment" element={<InfoPages />} />
              <Route path="/payment-policy" element={<InfoPages />} />

              {/* 404 */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
