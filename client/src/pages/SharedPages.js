// Shared pages across different user roles

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArtworkDetailPage from './ArtworkDetailPage';
import ChatPage from './ChatPage';
import ArtistsPage from './ArtistsPage';
import { getArtistById } from '../services/api';

export { ArtworkDetailPage };
export { ChatPage };
export { ArtistsPage };

export const ArtistProfilePage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtist();
  }, [id]);

  const fetchArtist = async () => {
    try {
      const response = await getArtistById(id);
      setArtist(response.data.artist);
    } catch (error) {
      console.error('Error fetching artist:', error);
      setError('Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{minHeight:'100vh',background:'#f5f5f5',padding:'100px 20px',textAlign:'center'}}>
        <h2>Loading artist profile...</h2>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div style={{minHeight:'100vh',background:'#f5f5f5',padding:'100px 20px',textAlign:'center'}}>
        <h2 style={{color:'#e74c3c'}}>Artist not found</h2>
        <Link to="/artists" style={{color:'#3498db',marginTop:'20px',display:'inline-block'}}>Back to Artists</Link>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',padding:'80px 20px'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{background:'#fff',borderRadius:'10px',padding:'40px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'30px',marginBottom:'30px'}}>
            <img 
              src={artist.profile_image || 'https://via.placeholder.com/150'} 
              alt={artist.full_name}
              style={{width:'150px',height:'150px',borderRadius:'50%',objectFit:'cover'}}
            />
            <div>
              <h1 style={{margin:'0 0 10px 0',color:'#2c3e50'}}>{artist.full_name}</h1>
              <p style={{color:'#7f8c8d',margin:'5px 0'}}>{artist.specialization || 'Artist'}</p>
              {artist.verified && <span style={{background:'#27ae60',color:'#fff',padding:'5px 10px',borderRadius:'5px',fontSize:'12px'}}>✓ Verified Artist</span>}
              <div style={{marginTop:'10px'}}>
                <span style={{color:'#f39c12',marginRight:'15px'}}>★ {artist.rating || '0.00'} Rating</span>
                <span style={{color:'#7f8c8d'}}>💼 {artist.total_sales || 0} Sales</span>
              </div>
            </div>
          </div>
          {artist.bio && <p style={{color:'#555',lineHeight:'1.8',marginBottom:'20px'}}>{artist.bio}</p>}
          {artist.portfolio_url && (
            <a href={artist.portfolio_url} target="_blank" rel="noopener noreferrer" style={{color:'#3498db',textDecoration:'none'}}>🌐 View Portfolio</a>
          )}
        </div>

        <h2 style={{margin:'30px 0 20px 0',color:'#2c3e50'}}>Artworks by {artist.full_name}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'20px'}}>
          {artist.artworks && artist.artworks.length > 0 ? (
            artist.artworks.map(artwork => (
              <Link to={`/artwork/${artwork.id}`} key={artwork.id} style={{textDecoration:'none',color:'inherit'}}>
                <div style={{background:'#fff',borderRadius:'10px',overflow:'hidden',boxShadow:'0 2px 5px rgba(0,0,0,0.1)',transition:'transform 0.2s',cursor:'pointer'}}>
                  <img src={artwork.image_url} alt={artwork.title} style={{width:'100%',height:'200px',objectFit:'cover'}} />
                  <div style={{padding:'15px'}}>
                    <h3 style={{margin:'0 0 10px 0',fontSize:'16px',color:'#2c3e50'}}>{artwork.title}</h3>
                    <p style={{color:'#27ae60',fontWeight:'bold',margin:'0'}}>${artwork.price}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p style={{color:'#7f8c8d',gridColumn:'1/-1',textAlign:'center'}}>No artworks available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfilePage = () => <div style={{minHeight:'100vh',background:'#000',color:'#fff',padding:'100px 20px',textAlign:'center'}}><h1>Profile Page</h1><p>View and edit your profile</p></div>;
export const NotFoundPage = () => <div style={{minHeight:'100vh',background:'#000',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><h1 style={{fontSize:'120px'}}>404</h1><p style={{fontSize:'24px'}}>Page Not Found</p></div>;
