import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import './Homepage.css';

const Homepage = () => {
  const newsCards = [
    {
      image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop',
      category: 'World',
      title: 'Global Leaders Gather for Historic Climate Summit',
      excerpt: 'World leaders from over 190 countries convene to address pressing environmental challenges.',
      time: '1 hour ago'
    },
    {
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
      category: 'Technology',
      title: 'Revolutionary Quantum Computer Breaks Records',
      excerpt: 'Scientists achieve breakthrough in quantum computing, promising faster problem-solving.',
      time: '3 hours ago'
    },
    {
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop',
      category: 'Business',
      title: 'Startup Ecosystem Flourishes in Emerging Markets',
      excerpt: 'Venture capital investments reach all-time high in developing economies.',
      time: '5 hours ago'
    },
    {
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
      category: 'Health',
      title: 'New Treatment Shows Promise for Rare Diseases',
      excerpt: 'Medical researchers develop innovative gene therapy approach.',
      time: '6 hours ago'
    },
    {
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop',
      category: 'Sports',
      title: 'Historic Victory Marks New Era in Athletics',
      excerpt: 'Underdog team clinches championship in stunning upset.',
      time: '8 hours ago'
    },
    {
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop',
      category: 'Entertainment',
      title: 'Blockbuster Film Breaks Box Office Records',
      excerpt: 'Latest superhero installment dominates global票房.',
      time: '10 hours ago'
    }
  ];

  return (
    <div className="homepage">
      <Navbar />
      <Hero />
      
      <section className="latest-news">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Latest News</h2>
            <span className="section-line"></span>
          </div>
          <div className="news-grid">
            {newsCards.map((news, index) => (
              <article key={index} className="news-card">
                <div className="news-image">
                  <img src={news.image} alt={news.title} />
                  <span className="news-category">{news.category}</span>
                </div>
                <div className="news-content">
                  <h3 className="news-title">{news.title}</h3>
                  <p className="news-excerpt">{news.excerpt}</p>
                  <div className="news-meta">
                    <span className="news-time">{news.time}</span>
                    <span className="read-more">Read more →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
