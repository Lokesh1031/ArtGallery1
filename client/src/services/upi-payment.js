// UPI Payment Service (Direct Artist Payment)
import axios from 'axios';

const API_URL = '/api/upi-payments';

// Get Artist UPI Details
export const getArtistUpiDetails = async (artistId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/artist/upi/${artistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get artist UPI details error:', error);
    throw error;
  }
};

// Submit Payment Proof (Screenshot)
export const submitPaymentProof = async (paymentData, screenshotFile) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('screenshot', screenshotFile);
    formData.append('order_id', paymentData.order_id);
    formData.append('artwork_id', paymentData.artwork_id);
    formData.append('artist_id', paymentData.artist_id);
    formData.append('transaction_id', paymentData.transaction_id);
    formData.append('payment_amount', paymentData.payment_amount);
    formData.append('upi_id', paymentData.upi_id);
    
    const response = await axios.post(
      `${API_URL}/payment-proof/submit`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Submit payment proof error:', error);
    throw error;
  }
};

// Get My Payments
export const getMyPayments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/my-payments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get my payments error:', error);
    throw error;
  }
};

// Get Payment Proof
export const getPaymentProof = async (paymentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/payment-proof/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get payment proof error:', error);
    throw error;
  }
};

export default {
  getArtistUpiDetails,
  submitPaymentProof,
  getMyPayments,
  getPaymentProof
};
