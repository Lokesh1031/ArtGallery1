import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login to /api/auth/login');
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('AuthContext: Login response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your connection.'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Attempting registration to /api/auth/register');
      console.log('AuthContext: Registration data:', { ...userData, password: '***' });
      
      const response = await axios.post('/api/auth/register', userData);
      console.log('AuthContext: Registration response:', response.data);
      
      return { 
        success: true, 
        message: response.data.message || 'Registration successful!' 
      };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isArtist: user?.role === 'artist',
    isCustomer: user?.role === 'customer',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
