import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log('RegisterPage: Submitting registration form');
    setLoading(true);
    
    const result = await register(formData);
    
    console.log('RegisterPage: Registration result:', result);
    
    if (result.success) {
      setSuccess(result.message);
      // Clear form
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        phone: '',
        address: ''
      });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Register for Art Gallery</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error" style={{ 
              background: '#fee', 
              color: '#c33', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              border: '1px solid #fcc',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ 
              background: '#efe', 
              color: '#3c3', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              border: '1px solid #cfc',
              fontWeight: '500'
            }}>
              ✓ {success}
            </div>
          )}
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
            {formData.password && formData.password.length < 6 && (
              <small style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Password must be at least 6 characters
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength="6"
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </small>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
              <small style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ✓ Passwords match
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Register as *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="customer">Customer</option>
              <option value="artist">Artist</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
