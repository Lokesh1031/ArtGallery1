import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { submitContact, getAllArtworks, getAllArtists } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalArtists: 0,
    activeUsers: 0,
    todaysSales: 0
  });
  const { onlineUsers } = useSocket();

  const slides = [
    {
      title: "Arts for Home",
      quote: "Transform your living space into a gallery of inspiration",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&q=80"
    },
    {
      title: "Arts for Office",
      quote: "Elevate your workspace with professional elegance",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1200&q=80"
    },
    {
      title: "Arts for Corporate Gifting",
      quote: "Make lasting impressions with unique artistic gifts",
      image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80"
    },
    {
      title: "Arts for Gifting",
      quote: "Give the gift of beauty and creativity",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&q=80"
    },
    {
      title: "Arts to Start Your Collection",
      quote: "Begin your artistic journey with curated masterpieces",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
    },
    {
      title: "Commissioned Artworks for You",
      quote: "Your vision, brought to life by talented artists",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const [artworksRes, artistsRes] = await Promise.all([
        getAllArtworks({ status: 'approved' }),
        getAllArtists({ status: 'approved' })
      ]);
      
      setStats(prev => ({
        ...prev,
        totalArtworks: artworksRes.data.count || 0,
        totalArtists: artistsRes.data.count || 0,
        activeUsers: onlineUsers.size || 0,
        todaysSales: Math.floor(Math.random() * 50) + 10 // Simulated for demo
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitContact(formData);
      setFormStatus({
        type: 'success',
        message: response.data.message
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message'
      });
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="hero-title">Art Gallery</h1>
          <p className="hero-subtitle">Discover, Collect, and Commission Extraordinary Art</p>
          
          {/* Real-time Statistics */}
          <motion.div 
            className="stats-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="stat-item">
              <span className="stat-number">{stats.totalArtworks}</span>
              <span className="stat-label">Artworks Available</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalArtists}</span>
              <span className="stat-label">Talented Artists</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{stats.activeUsers}</span>
              <span className="stat-label">Users Online</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{stats.todaysSales}</span>
              <span className="stat-label">Sales Today</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Slider Section */}
      <section className="slider-section">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="slide-image">
                <img src={slide.image} alt={slide.title} />
                <div className="slide-overlay"></div>
              </div>
              <div className="slide-content">
                <h2>{slide.title}</h2>
                <p className="quote">{slide.quote}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <Link to="/gallery">
          <motion.button
            className="btn btn-primary cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go To Gallery
          </motion.button>
        </Link>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>About Art Gallery Shop</h2>
            <p>
              Welcome to Art Gallery Shop, your premier destination for discovering and acquiring 
              exceptional artworks. We connect passionate artists with discerning collectors, 
              creating a vibrant marketplace where creativity thrives.
            </p>
            <p>
              Whether you're looking to beautify your home, enhance your office space, find the 
              perfect gift, or commission a custom piece, our platform offers an immersive 
              experience with carefully curated collections from talented artists worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <motion.div
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="step-number">1</div>
              <h3>Browse & Discover</h3>
              <p>Explore our extensive collection of artworks across various categories and styles</p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">2</div>
              <h3>Connect with Artists</h3>
              <p>Chat directly with artists to learn more about their work and process</p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="step-number">3</div>
              <h3>Purchase or Bid</h3>
              <p>Buy artworks instantly or participate in bidding for highly sought-after pieces</p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="step-number">4</div>
              <h3>Enjoy Your Art</h3>
              <p>Receive your artwork and enjoy its beauty while supporting talented artists</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-section">
        <div className="container">
          <h2>Have Questions? Get in Touch</h2>
          <motion.form
            className="contact-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {formStatus.message && (
              <div className={`alert alert-${formStatus.type === 'success' ? 'success' : 'error'}`}>
                {formStatus.message}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="5"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Send Message
            </button>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Art Gallery</h3>
            <div className="footer-contact">
              <p><strong>Contact Us:</strong> +91 8074386797</p>
              <p>care@artgallery.in</p>
              <p>11am-7pm (IST), Mon-Sat</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>For buyer</h4>
            <ul>
              <li><Link to="/faq">FAQ's</Link></li>
              <li><Link to="/shipping">Shipping & Delivery</Link></li>
              <li><Link to="/packaging">Packaging & Framing</Link></li>
              <li><Link to="/corporate">Corporate Orders</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/help">Buying Process & Help</Link></li>
              <li><Link to="/track">Track Your Order</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For artist</h4>
            <ul>
              <li><Link to="/register?role=artist">Artist's Corner</Link></li>
              <li><Link to="/why-sell">Why Sell With Us?</Link></li>
              <li><Link to="/artist-faq">FAQ's</Link></li>
              <li><Link to="/shows">Participate in Shows</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>About us</h4>
            <ul>
              <li><Link to="/about">Who Are We?</Link></li>
              <li><Link to="/press">Press/Events</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Policies</h4>
            <ul>
              <li><Link to="/environment">Environment</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/payment-policy">Payment</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Art Gallery Shop. All rights reserved.</p>
          <p>Connecting Artists and Collectors Worldwide</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
