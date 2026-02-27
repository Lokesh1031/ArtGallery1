import axios from 'axios';

const API_URL = '/api';

// ... existing code ...

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
