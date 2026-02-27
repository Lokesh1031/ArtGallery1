// Admin Module Pages

import React, { useState, useEffect } from 'react';
import { getAllArtists, getAllArtworks, updateArtistStatus, updateArtworkStatus, getAllContacts, getAllUsers } from '../../services/api';

export const AdminDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Manage Artists</h3>
            <a href="/admin/artists" className="btn btn-primary">View Artists</a>
          </div>
          <div className="dashboard-card">
            <h3>Manage Artworks</h3>
            <a href="/admin/artworks" className="btn btn-primary">View Artworks</a>
          </div>
          <div className="dashboard-card">
            <h3>Manage Users</h3>
            <a href="/admin/users" className="btn btn-primary">View Users</a>
          </div>
          <div className="dashboard-card">
            <h3>Contact Forms</h3>
            <a href="/admin/contacts" className="btn btn-primary">View Messages</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManageArtists = () => {
  const [artists, setArtists] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, [filter]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await getAllArtists(params);
      setArtists(res.data.artists || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateArtistStatus(id, status);
      fetchArtists();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Manage Artists</h1>
        
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
          <button 
            onClick={() => setFilter('pending')} 
            style={{
              padding: '8px 16px',
              background: filter === 'pending' ? '#3498db' : '#ecf0f1',
              color: filter === 'pending' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Pending ({artists.filter(a => a.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilter('approved')} 
            style={{
              padding: '8px 16px',
              background: filter === 'approved' ? '#27ae60' : '#ecf0f1',
              color: filter === 'approved' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('rejected')} 
            style={{
              padding: '8px 16px',
              background: filter === 'rejected' ? '#e74c3c' : '#ecf0f1',
              color: filter === 'rejected' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Rejected
          </button>
          <button 
            onClick={() => setFilter('all')} 
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? '#95a5a6' : '#ecf0f1',
              color: filter === 'all' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            All Artists
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : artists.length === 0 ? (
          <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>No artists found</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {artists.map(artist => (
              <div key={artist.id} style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                      <img 
                        src={artist.profile_image || 'https://via.placeholder.com/60'} 
                        alt={artist.full_name}
                        style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
                      />
                      <div>
                        <h3 style={{margin: '0 0 5px 0', color: '#2c3e50'}}>{artist.full_name}</h3>
                        <p style={{margin: '0', color: '#7f8c8d', fontSize: '14px'}}>{artist.email}</p>
                        <p style={{margin: '5px 0 0 0', color: '#95a5a6', fontSize: '13px'}}>
                          {artist.specialization || 'No specialization'}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', gap: '20px', fontSize: '14px', color: '#7f8c8d', marginTop: '10px'}}>
                      <span>📱 {artist.phone || 'N/A'}</span>
                      <span>🎨 {artist.artwork_count || 0} Artworks</span>
                      <span>⭐ {artist.rating || '0.00'} Rating</span>
                      <span>💼 {artist.total_sales || 0} Sales</span>
                    </div>
                    
                    {artist.bio && (
                      <p style={{margin: '10px 0 0 0', color: '#555', fontSize: '14px', lineHeight: '1.5'}}>
                        {artist.bio.substring(0, 150)}{artist.bio.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '20px'}}>
                    <span style={{
                      background: artist.status === 'approved' ? '#27ae60' : artist.status === 'pending' ? '#f39c12' : '#e74c3c',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {artist.status}
                    </span>
                    
                    {artist.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(artist.id, 'approved')}
                        style={{
                          background: '#27ae60',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✓ Approve
                      </button>
                    )}
                    
                    {artist.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(artist.id, 'rejected')}
                        style={{
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✕ Reject
                      </button>
                    )}
                    
                    <a 
                      href={`/artist/${artist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#3498db',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      👁 View Profile
                    </a>
                  </div>
                </div>
                
                <small style={{display: 'block', marginTop: '10px', color: '#999', fontSize: '12px'}}>
                  Joined: {new Date(artist.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ManageArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    fetchArtworks();
  }, [filter]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await getAllArtworks(params);
      setArtworks(res.data.artworks || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateArtworkStatus(id, status);
      fetchArtworks();
      if (selectedArtwork && selectedArtwork.id === id) {
        setSelectedArtwork(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Manage Artworks</h1>
        
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
          <button 
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 16px',
              background: filter === 'pending' ? '#f39c12' : '#ecf0f1',
              color: filter === 'pending' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Pending ({artworks.filter(a => a.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilter('approved')}
            style={{
              padding: '8px 16px',
              background: filter === 'approved' ? '#27ae60' : '#ecf0f1',
              color: filter === 'approved' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            style={{
              padding: '8px 16px',
              background: filter === 'rejected' ? '#e74c3c' : '#ecf0f1',
              color: filter === 'rejected' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Rejected
          </button>
          <button 
            onClick={() => setFilter('sold')}
            style={{
              padding: '8px 16px',
              background: filter === 'sold' ? '#9b59b6' : '#ecf0f1',
              color: filter === 'sold' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sold
          </button>
          <button 
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? '#95a5a6' : '#ecf0f1',
              color: filter === 'all' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            All Artworks
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : artworks.length === 0 ? (
          <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>No artworks found</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {artworks.map(artwork => (
              <div key={artwork.id} style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedArtwork(artwork)}
              >
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={artwork.image_url || 'https://via.placeholder.com/300'}
                    alt={artwork.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <div style={{padding: '15px'}}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    color: '#2c3e50',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {artwork.title}
                  </h3>
                  
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '13px',
                    color: '#7f8c8d'
                  }}>
                    By: {artwork.artist_name || 'Unknown Artist'}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#27ae60'
                    }}>
                      ${artwork.price}
                    </span>
                    <span style={{
                      background: artwork.status === 'approved' ? '#27ae60' : 
                                artwork.status === 'pending' ? '#f39c12' : 
                                artwork.status === 'sold' ? '#9b59b6' : '#e74c3c',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {artwork.status}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#95a5a6',
                    marginBottom: '12px'
                  }}>
                    <div>📦 {artwork.category_name || 'Uncategorized'}</div>
                    <div>📏 {artwork.dimensions || 'N/A'}</div>
                    <div>📅 {new Date(artwork.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {artwork.status !== 'approved' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(artwork.id, 'approved');
                        }}
                        style={{
                          flex: 1,
                          background: '#27ae60',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {artwork.status !== 'rejected' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(artwork.id, 'rejected');
                        }}
                        style={{
                          flex: 1,
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕ Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Artwork Detail Modal */}
        {selectedArtwork && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedArtwork(null)}
          >
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedArtwork(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  zIndex: 1001
                }}
              >
                ✕
              </button>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                padding: '30px'
              }}>
                <div>
                  <img 
                    src={selectedArtwork.image_url || 'https://via.placeholder.com/400'}
                    alt={selectedArtwork.title}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                    }}
                  />
                </div>
                
                <div>
                  <h2 style={{margin: '0 0 15px 0', color: '#2c3e50'}}>
                    {selectedArtwork.title}
                  </h2>
                  
                  <div style={{marginBottom: '20px'}}>
                    <span style={{
                      background: selectedArtwork.status === 'approved' ? '#27ae60' : 
                                selectedArtwork.status === 'pending' ? '#f39c12' : 
                                selectedArtwork.status === 'sold' ? '#9b59b6' : '#e74c3c',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}>
                      {selectedArtwork.status}
                    </span>
                  </div>
                  
                  <div style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <div style={{fontSize: '14px', color: '#555', lineHeight: '2'}}>
                      <div><strong>Artist:</strong> {selectedArtwork.artist_name}</div>
                      <div><strong>Price:</strong> <span style={{color: '#27ae60', fontSize: '18px', fontWeight: 'bold'}}>${selectedArtwork.price}</span></div>
                      <div><strong>Category:</strong> {selectedArtwork.category_name || 'Uncategorized'}</div>
                      <div><strong>Dimensions:</strong> {selectedArtwork.dimensions || 'N/A'}</div>
                      <div><strong>Medium:</strong> {selectedArtwork.medium || 'N/A'}</div>
                      <div><strong>Year:</strong> {selectedArtwork.year_created || 'N/A'}</div>
                      <div><strong>Listed:</strong> {new Date(selectedArtwork.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{marginBottom: '20px'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#555'}}>Description</h4>
                    <p style={{color: '#666', lineHeight: '1.6', fontSize: '14px'}}>
                      {selectedArtwork.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div style={{display: 'flex', gap: '10px'}}>
                    {selectedArtwork.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedArtwork.id, 'approved')}
                        style={{
                          flex: 1,
                          background: '#27ae60',
                          color: '#fff',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓ Approve Artwork
                      </button>
                    )}
                    {selectedArtwork.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedArtwork.id, 'rejected')}
                        style={{
                          flex: 1,
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕ Reject Artwork
                      </button>
                    )}
                  </div>
                  
                  <a 
                    href={`/artist/${selectedArtwork.artist_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      marginTop: '10px',
                      textAlign: 'center',
                      background: '#3498db',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    👁 View Artist Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const res = await getAllUsers(params);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateArtistStatus(id, status); // This endpoint works for all users
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Manage Users</h1>
        
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        />

        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={() => setRoleFilter('all')}
              style={{
                padding: '8px 16px',
                background: roleFilter === 'all' ? '#3498db' : '#ecf0f1',
                color: roleFilter === 'all' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              All Roles
            </button>
            <button 
              onClick={() => setRoleFilter('customer')}
              style={{
                padding: '8px 16px',
                background: roleFilter === 'customer' ? '#9b59b6' : '#ecf0f1',
                color: roleFilter === 'customer' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              👤 Customers
            </button>
            <button 
              onClick={() => setRoleFilter('artist')}
              style={{
                padding: '8px 16px',
                background: roleFilter === 'artist' ? '#e67e22' : '#ecf0f1',
                color: roleFilter === 'artist' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🎨 Artists
            </button>
            <button 
              onClick={() => setRoleFilter('admin')}
              style={{
                padding: '8px 16px',
                background: roleFilter === 'admin' ? '#16a085' : '#ecf0f1',
                color: roleFilter === 'admin' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              👑 Admins
            </button>
          </div>
          
          <div style={{display: 'flex', gap: '10px', marginLeft: 'auto'}}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                background: filter === 'all' ? '#95a5a6' : '#ecf0f1',
                color: filter === 'all' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              style={{
                padding: '8px 16px',
                background: filter === 'pending' ? '#f39c12' : '#ecf0f1',
                color: filter === 'pending' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('approved')}
              style={{
                padding: '8px 16px',
                background: filter === 'approved' ? '#27ae60' : '#ecf0f1',
                color: filter === 'approved' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('rejected')}
              style={{
                padding: '8px 16px',
                background: filter === 'rejected' ? '#e74c3c' : '#ecf0f1',
                color: filter === 'rejected' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Suspended
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>No users found</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{background: '#34495e', color: '#fff'}}>
                  <th style={{padding: '15px', textAlign: 'left'}}>User</th>
                  <th style={{padding: '15px', textAlign: 'left'}}>Contact</th>
                  <th style={{padding: '15px', textAlign: 'center'}}>Role</th>
                  <th style={{padding: '15px', textAlign: 'center'}}>Status</th>
                  <th style={{padding: '15px', textAlign: 'center'}}>Joined</th>
                  <th style={{padding: '15px', textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid #ecf0f1',
                    background: index % 2 === 0 ? '#fff' : '#f8f9fa'
                  }}>
                    <td style={{padding: '15px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <img 
                          src={user.profile_image || 'https://via.placeholder.com/40'} 
                          alt={user.full_name}
                          style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}}
                        />
                        <div>
                          <div style={{fontWeight: '600', color: '#2c3e50'}}>{user.full_name}</div>
                          {user.specialization && (
                            <div style={{fontSize: '12px', color: '#95a5a6'}}>{user.specialization}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{padding: '15px'}}>
                      <div style={{fontSize: '14px', color: '#555'}}>{user.email}</div>
                      <div style={{fontSize: '12px', color: '#999'}}>{user.phone || 'No phone'}</div>
                    </td>
                    <td style={{padding: '15px', textAlign: 'center'}}>
                      <span style={{
                        background: user.role === 'admin' ? '#16a085' : user.role === 'artist' ? '#e67e22' : '#9b59b6',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {user.role === 'admin' ? '👑' : user.role === 'artist' ? '🎨' : '👤'} {user.role}
                      </span>
                    </td>
                    <td style={{padding: '15px', textAlign: 'center'}}>
                      <span style={{
                        background: user.status === 'approved' ? '#27ae60' : user.status === 'pending' ? '#f39c12' : '#e74c3c',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{padding: '15px', textAlign: 'center', fontSize: '13px', color: '#7f8c8d'}}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{padding: '15px'}}>
                      <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                        {user.status !== 'approved' && (
                          <button 
                            onClick={() => handleStatusUpdate(user.id, 'approved')}
                            style={{
                              background: '#27ae60',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Activate"
                          >
                            ✓
                          </button>
                        )}
                        {user.status !== 'rejected' && user.role !== 'admin' && (
                          <button 
                            onClick={() => handleStatusUpdate(user.id, 'rejected')}
                            style={{
                              background: '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Suspend"
                          >
                            ✕
                          </button>
                        )}
                        {user.role === 'artist' && (
                          <a 
                            href={`/artist/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#3498db',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'none'
                            }}
                            title="View Profile"
                          >
                            👁
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div style={{marginTop: '20px', padding: '15px', background: '#ecf0f1', borderRadius: '5px'}}>
          <div style={{display: 'flex', gap: '30px', fontSize: '14px', color: '#555'}}>
            <div><strong>Total Users:</strong> {filteredUsers.length}</div>
            <div><strong>Customers:</strong> {filteredUsers.filter(u => u.role === 'customer').length}</div>
            <div><strong>Artists:</strong> {filteredUsers.filter(u => u.role === 'artist').length}</div>
            <div><strong>Admins:</strong> {filteredUsers.filter(u => u.role === 'admin').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactForms = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await getAllContacts();
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-page"><div className="container"><h1>Contact Forms</h1><p>Loading...</p></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Contact Forms</h1>
        <p style={{marginBottom: '20px', color: '#666'}}>Total Messages: {contacts.length}</p>
        
        {contacts.length === 0 ? (
          <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>No contact messages yet</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {contacts.map(contact => (
              <div key={contact.id} style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px'}}>
                  <div>
                    <h3 style={{margin: '0 0 5px 0', color: '#2c3e50'}}>{contact.name}</h3>
                    <p style={{margin: '0', color: '#7f8c8d', fontSize: '14px'}}>{contact.email}</p>
                  </div>
                  <span style={{
                    background: contact.status === 'new' ? '#e74c3c' : contact.status === 'read' ? '#f39c12' : '#27ae60',
                    color: '#fff',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {contact.status || 'new'}
                  </span>
                </div>
                
                {contact.subject && (
                  <p style={{margin: '10px 0', fontWeight: 'bold', color: '#34495e'}}>Subject: {contact.subject}</p>
                )}
                
                <p style={{margin: '15px 0', color: '#555', lineHeight: '1.6'}}>{contact.message}</p>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0'}}>
                  <small style={{color: '#999'}}>{new Date(contact.created_at).toLocaleString()}</small>
                  <div style={{display: 'flex', gap: '10px'}}>
                    {contact.status !== 'read' && (
                      <button 
                        onClick={() => handleStatusUpdate(contact.id, 'read')}
                        style={{
                          background: '#3498db',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    {contact.status !== 'responded' && (
                      <button 
                        onClick={() => handleStatusUpdate(contact.id, 'responded')}
                        style={{
                          background: '#27ae60',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Mark as Responded
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
