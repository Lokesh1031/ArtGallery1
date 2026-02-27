import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllArtists } from '../services/api';
import './ArtistsPage.css';

const ArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArtists, setFilteredArtists] = useState([]);

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    const filtered = artists.filter(artist =>
      artist.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArtists(filtered);
  }, [searchTerm, artists]);

  const fetchArtists = async () => {
    try {
      const response = await getAllArtists({ status: 'approved' });
      setArtists(response.data.artists || []);
      setFilteredArtists(response.data.artists || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading artists...</p>
      </div>
    );
  }

  return (
    <div className="artists-page">
      <div className="artists-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Our Talented Artists</h1>
            <p>Discover amazing artists from around the world</p>
          </motion.div>

          <motion.div
            className="search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <div className="artists-count">
          <p>{filteredArtists.length} {filteredArtists.length === 1 ? 'Artist' : 'Artists'} Found</p>
        </div>

        {filteredArtists.length === 0 ? (
          <div className="no-artists">
            <h2>No artists found</h2>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="artists-grid">
            {filteredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                className="artist-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/artist/${artist.id}`}>
                  <div className="artist-image">
                    {artist.profile_image ? (
                      <img src={artist.profile_image} alt={artist.full_name} />
                    ) : (
                      <div className="artist-placeholder">
                        {artist.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="artist-info">
                    <h3>{artist.full_name}</h3>
                    {artist.bio && (
                      <p className="artist-bio">
                        {artist.bio.length > 100 
                          ? `${artist.bio.substring(0, 100)}...` 
                          : artist.bio}
                      </p>
                    )}
                    
                    <div className="artist-stats">
                      <span className="stat">
                        <span className="stat-icon">🎨</span>
                        {artist.artwork_count || 0} Artworks
                      </span>
                      <span className="stat">
                        <span className="stat-icon">⭐</span>
                        {artist.rating || '5.0'}
                      </span>
                    </div>

                    <button className="btn-view-profile">View Profile</button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;
