// Razorpay Payment Service (Frontend)
import axios from 'axios';

const API_URL = '/api/payments';

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay Order
export const createPaymentOrder = async (amount, receipt, notes) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/create-order`,
      {
        amount,
        currency: 'INR',
        receipt,
        notes
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// Verify Payment
export const verifyPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/verify`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

// Initialize Razorpay Payment
export const initiateRazorpayPayment = async (
  orderData,
  shippingDetails,
  cartItems,
  onSuccess,
  onFailure
) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    // Get user info
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      alert('Please login to continue');
      return;
    }

    // Razorpay options
    const options = {
      key: orderData.key_id,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'Art Gallery Shop',
      description: 'Purchase Artwork',
      image: '/logo.png', // Your logo URL
      order_id: orderData.order.id,
      
      // Customer details
      prefill: {
        name: shippingDetails.fullName,
        email: shippingDetails.email,
        contact: shippingDetails.phone
      },

      // Payment methods available
      config: {
        display: {
          blocks: {
            banks: {
              name: 'All payment methods',
              instruments: [
                {
                  method: 'upi'
                },
                {
                  method: 'card'
                },
                {
                  method: 'netbanking'
                },
                {
                  method: 'wallet'
                }
              ]
            }
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: true
          }
        }
      },

      // Theme customization
      theme: {
        color: '#667eea' // Your brand color
      },

      // Modal options
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
          if (onFailure) {
            onFailure('Payment cancelled by user');
          }
        }
      },

      // Success handler
      handler: async function (response) {
        try {
          console.log('Payment successful:', response);
          
          // Verify payment on backend
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_items: cartItems.map(item => item.id),
            shipping_details: shippingDetails
          };

          const verifyResponse = await verifyPayment(verificationData);
          
          if (verifyResponse.success) {
            if (onSuccess) {
              onSuccess(verifyResponse);
            }
          } else {
            if (onFailure) {
              onFailure('Payment verification failed');
            }
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          if (onFailure) {
            onFailure('Payment verification failed');
          }
        }
      }
    };

    // Open Razorpay checkout
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    // Handle payment failure
    paymentObject.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      if (onFailure) {
        onFailure(response.error.description);
      }
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    if (onFailure) {
      onFailure('Failed to initiate payment');
    }
  }
};

// Get user payments history
export const getUserPayments = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Get payments error:', error);
    throw error;
  }
};

export default {
  loadRazorpayScript,
  createPaymentOrder,
  verifyPayment,
  initiateRazorpayPayment,
  getUserPayments
};
