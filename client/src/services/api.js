import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Artworks
export const getAllArtworks = (params = {}) => {
  return axios.get(`${API_URL}/artworks`, { params });
};

export const getArtworkById = (id) => {
  return axios.get(`${API_URL}/artworks/${id}`);
};

export const createArtwork = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/artworks`, formData, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateArtwork = (id, formData) => {
  return axios.put(`${API_URL}/artworks/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteArtwork = (id) => {
  return axios.delete(`${API_URL}/artworks/${id}`);
};

export const updateArtworkStatus = (id, status) => {
  return axios.patch(`${API_URL}/artworks/${id}/status`, { status });
};

// Artists
export const getAllArtists = (params = {}) => {
  return axios.get(`${API_URL}/artists`, { params });
};

export const getArtistById = (id) => {
  return axios.get(`${API_URL}/artists/${id}`);
};

export const updateArtistProfile = (id, data) => {
  return axios.put(`${API_URL}/artists/${id}`, data);
};

export const updateArtistStatus = (id, status) => {
  return axios.patch(`${API_URL}/artists/${id}/status`, { status });
};

// Contact Forms
export const submitContact = (data) => {
  return axios.post(`${API_URL}/contact`, data);
};

export const getAllContacts = (params = {}) => {
  return axios.get(`${API_URL}/contact`, { params });
};

export const updateContactStatus = (id, status) => {
  return axios.patch(`${API_URL}/contact/${id}/status`, { status });
};

// Orders
export const createOrder = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/orders`, data, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
};

export const addToCart = (artworkId, quantity = 1) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/orders`, { 
    artwork_id: artworkId, 
    quantity: quantity,
    shipping_address: 'To be updated',
    payment_method: 'pending',
    notes: 'Cart item'
  }, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getUserOrders = (userId) => {
  return axios.get(`${API_URL}/orders/user/${userId}`);
};

export const getArtistSales = (artistId) => {
  return axios.get(`${API_URL}/orders/artist/${artistId}`);
};

export const updateOrderStatus = (id, status) => {
  return axios.patch(`${API_URL}/orders/${id}/status`, { status });
};

export const updateOrder = (id, data) => {
  return axios.put(`${API_URL}/orders/${id}`, data);
};

export const deleteOrder = (id) => {
  return axios.delete(`${API_URL}/orders/${id}`);
};

// Wishlist
export const addToWishlist = (artwork_id) => {
  return axios.post(`${API_URL}/wishlist`, { artwork_id });
};

export const getUserWishlist = (userId) => {
  return axios.get(`${API_URL}/wishlist/user/${userId}`);
};

export const removeFromWishlist = (wishlistId) => {
  return axios.delete(`${API_URL}/wishlist/${wishlistId}`);
};

export const checkWishlist = (artworkId) => {
  return axios.get(`${API_URL}/wishlist/check/${artworkId}`);
};

// Bids
export const placeBid = (data) => {
  return axios.post(`${API_URL}/bids`, data);
};

export const createBid = (artworkId, amount) => {
  return axios.post(`${API_URL}/bids`, { artwork_id: artworkId, bid_amount: amount });
};

export const getArtworkBids = (artworkId) => {
  return axios.get(`${API_URL}/bids/artwork/${artworkId}`);
};

export const getUserBids = (userId) => {
  return axios.get(`${API_URL}/bids/user/${userId}`);
};

export const acceptBid = (id) => {
  return axios.patch(`${API_URL}/bids/${id}/accept`);
};

// Reviews
export const addReview = (data) => {
  return axios.post(`${API_URL}/reviews`, data);
};

export const submitReview = (artworkId, reviewData) => {
  return axios.post(`${API_URL}/reviews`, { 
    artwork_id: artworkId, 
    rating: reviewData.rating,
    artist_rating: reviewData.artistRating,
    comment: reviewData.comment 
  });
};

export const getArtworkReviews = (artworkId) => {
  return axios.get(`${API_URL}/reviews/artwork/${artworkId}`);
};

export const getUserReviews = (userId) => {
  return axios.get(`${API_URL}/reviews/user/${userId}`);
};

export const canReviewArtwork = (artworkId) => {
  return axios.get(`${API_URL}/reviews/can-review/${artworkId}`);
};

// Messages
export const sendMessage = (data) => {
  return axios.post(`${API_URL}/messages`, data);
};

export const getConversation = (userId) => {
  return axios.get(`${API_URL}/messages/conversation/${userId}`);
};

export const getAllConversations = () => {
  return axios.get(`${API_URL}/messages/conversations`);
};

export const markAsRead = (senderId) => {
  return axios.patch(`${API_URL}/messages/read/${senderId}`);
};

// Categories
export const getAllCategories = () => {
  return axios.get(`${API_URL}/categories`);
};

export const getCategoryTree = () => {
  return axios.get(`${API_URL}/categories/tree`);
};

// Users
export const getUserProfile = (id) => {
  return axios.get(`${API_URL}/users/${id}`);
};

export const updateUserProfile = (id, formData) => {
  return axios.put(`${API_URL}/users/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getAllUsers = (params = {}) => {
  return axios.get(`${API_URL}/users`, { params });
};
