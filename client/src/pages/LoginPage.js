import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', formData.email);
    
    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        const user = result.user;
        console.log('Login successful for user:', user);
        if (user.role === 'artist') navigate('/artist-dashboard');
        else if (user.role === 'customer') navigate('/customer-dashboard');
        else if (user.role === 'admin') navigate('/admin-dashboard');
      } else {
        console.error('Login failed:', result.message);
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login to Art Gallery</h1>
        
        {/* Test Credentials */}
        <div style={{ 
          background: 'rgba(102, 126, 234, 0.1)', 
          border: '1px solid rgba(102, 126, 234, 0.3)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <strong style={{ color: '#667eea', display: 'block', marginBottom: '10px' }}>
            🔐 Test Login Credentials:
          </strong>
          <div style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
            <div><strong>Admin:</strong> admin@artgallery.com / admin123</div>
            <div><strong>Artist:</strong> sophia.martinez@artist.com / artist123</div>
            <div><strong>Customer:</strong> customer@test.com / customer123</div>
          </div>
        </div>

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
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{ WebkitTextSecurity: 'disc' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
