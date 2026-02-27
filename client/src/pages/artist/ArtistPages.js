// Artist Module Pages

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllArtworks, createArtwork } from '../../services/api';
import './ArtistPages.css';

export const ArtistDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Artist Dashboard</h1>
        <p>Welcome back, {user?.full_name}!</p>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Upload Artwork</h3>
            <a href="/upload-artwork" className="btn btn-primary">Upload New</a>
          </div>
          <div className="dashboard-card">
            <h3>My Artworks</h3>
            <a href="/my-artworks" className="btn btn-primary">View All</a>
          </div>
          <div className="dashboard-card">
            <h3>Sales & Earnings</h3>
            <a href="/my-sales" className="btn btn-primary">View Sales</a>
          </div>
          <div className="dashboard-card upi-payment-card">
            <h3>💳 UPI Payment Setup</h3>
            <p>Configure your UPI for customer payments</p>
            <a href="/artist/upi-setup" className="btn btn-primary">Setup UPI</a>
          </div>
          <div className="dashboard-card">
            <h3>Messages</h3>
            <a href="/chat" className="btn btn-primary">Open Chat</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UploadArtwork = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    materials: '',
    dimensions: '',
    year_created: '',
    provenance: '',
    bidding_enabled: false
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to upload artwork');
      setMessageType('error');
      setLoading(false);
      return;
    }
    
    console.log('Token exists:', !!token);
    console.log('Form data:', formData);
    console.log('Image file:', image);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        data.append(key, formData[key]);
        console.log(`Appending ${key}:`, formData[key]);
      }
    });
    
    if (image) {
      data.append('image', image);
      console.log('Image appended:', image.name, image.size, 'bytes');
    }

    try {
      console.log('Sending request to upload artwork...');
      const response = await createArtwork(data);
      console.log('Upload response:', response);
      
      setMessage('Artwork uploaded successfully! Waiting for admin approval.');
      setMessageType('success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category_id: '',
        price: '',
        materials: '',
        dimensions: '',
        year_created: '',
        provenance: '',
        bidding_enabled: false
      });
      setImage(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        // Error in request setup
        errorMessage = error.message;
      }
      
      setMessage('Failed to upload artwork: ' + errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Upload Artwork</h1>
        {message && (
          <div className={`alert alert-${messageType}`} style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '5px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="upload-form" style={{maxWidth: '600px'}}>
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Title *
            </label>
            <input 
              type="text" 
              placeholder="Artwork Title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Description
            </label>
            <textarea 
              placeholder="Describe your artwork..." 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows="4"
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Category
            </label>
            <select 
              value={formData.category_id} 
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Price ($) *
            </label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
              required 
              min="0"
              step="0.01"
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Materials
            </label>
            <input 
              type="text" 
              placeholder="e.g., Oil on canvas" 
              value={formData.materials} 
              onChange={(e) => setFormData({...formData, materials: e.target.value})} 
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Dimensions
            </label>
            <input 
              type="text" 
              placeholder='e.g., 24" x 36"' 
              value={formData.dimensions} 
              onChange={(e) => setFormData({...formData, dimensions: e.target.value})} 
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Year Created
            </label>
            <input 
              type="number" 
              placeholder="2024" 
              value={formData.year_created} 
              onChange={(e) => setFormData({...formData, year_created: e.target.value})} 
              min="1900"
              max={new Date().getFullYear()}
              style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Image *
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
              required 
              style={{width: '100%', padding: '10px'}}
            />
            {image && (
              <div style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>
                Selected: {image.name}
              </div>
            )}
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={formData.bidding_enabled} 
                onChange={(e) => setFormData({...formData, bidding_enabled: e.target.checked})} 
                style={{marginRight: '8px'}}
              />
              <span style={{fontWeight: 'bold'}}>Enable Bidding</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading...' : 'Upload Artwork'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const MyArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchArtworks();
    }
  }, [user?.id]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING ARTWORKS ===');
      console.log('Artist ID:', user?.id);
      console.log('Requesting with params:', { artist: user?.id, status: '' });
      
      const res = await getAllArtworks({ artist: user?.id, status: '' });
      
      console.log('Response status:', res.status);
      console.log('Response data:', res.data);
      console.log('Artworks array:', res.data.artworks);
      console.log('Artworks count:', res.data.artworks?.length);
      
      if (res.data.artworks && Array.isArray(res.data.artworks)) {
        setArtworks(res.data.artworks);
        console.log('✅ Set artworks state with', res.data.artworks.length, 'items');
      } else {
        console.error('❌ Invalid artworks data:', res.data);
        setArtworks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching artworks:', error);
      console.error('Error response:', error.response);
      setArtworks([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETE ===');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { background: '#f39c12', color: '#fff' },
      approved: { background: '#27ae60', color: '#fff' },
      rejected: { background: '#e74c3c', color: '#fff' },
      sold: { background: '#9b59b6', color: '#fff' }
    };
    return styles[status] || { background: '#95a5a6', color: '#fff' };
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>My Artworks</h1>
          <a href="/artist/upload" className="btn btn-primary">+ Upload New Artwork</a>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading your artworks...</p>
        ) : artworks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <h3 style={{ color: '#555', marginBottom: '10px' }}>No artworks yet</h3>
            <p style={{ color: '#777', marginBottom: '20px' }}>Upload your first artwork to get started!</p>
            <a href="/artist/upload" className="btn btn-primary">Upload Artwork</a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {artworks.map(art => (
              <div key={art.id} style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#f5f5f5',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={art.image_url} 
                    alt={art.title} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <div style={{ padding: '15px' }}>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '18px',
                    color: '#2c3e50',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {art.title}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#27ae60'
                    }}>
                      ${art.price}
                    </span>
                    
                    <span style={{
                      ...getStatusBadgeStyle(art.status),
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {art.status}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    marginTop: '10px'
                  }}>
                    <div>👁 {art.views || 0} views</div>
                    <div>📅 {new Date(art.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#ecf0f1',
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px'
        }}>
          <div><strong>Total Artworks:</strong> {artworks.length}</div>
          <div><strong>Pending:</strong> {artworks.filter(a => a.status === 'pending').length}</div>
          <div><strong>Approved:</strong> {artworks.filter(a => a.status === 'approved').length}</div>
          <div><strong>Rejected:</strong> {artworks.filter(a => a.status === 'rejected').length}</div>
        </div>
      </div>
    </div>
  );
};
