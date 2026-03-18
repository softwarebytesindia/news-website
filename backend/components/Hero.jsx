import React from 'react';
import './Hero.css';

const Hero = () => {
  const featuredNews = {
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop',
    category: 'Technology',
    title: 'The Future of AI: How Machine Learning is Transforming Our World',
    excerpt: 'Artificial intelligence continues to revolutionize industries from healthcare to transportation, creating new opportunities and challenges for society.',
    author: 'Sarah Johnson',
    date: 'March 18, 2026',
    readTime: '5 min read'
  };

  const sideNews = [
    {
      category: 'Business',
      title: 'Global Markets Rally as Tech Stocks Surge',
      time: '2 hours ago'
    },
    {
      category: 'Sports',
      title: 'Championship Finals Set to Break Viewership Records',
      time: '3 hours ago'
    },
    {
      category: 'Science',
      title: 'NASA Announces Breakthrough in Space Exploration',
      time: '4 hours ago'
    }
  ];

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-featured">
          <div className="featured-image">
            <img src={featuredNews.image} alt={featuredNews.title} />
            <div className="featured-overlay">
              <span className="featured-category">{featuredNews.category}</span>
              <h1 className="featured-title">{featuredNews.title}</h1>
              <p className="featured-excerpt">{featuredNews.excerpt}</p>
              <div className="featured-meta">
                <span className="author">{featuredNews.author}</span>
                <span className="separator">•</span>
                <span>{featuredNews.date}</span>
                <span className="separator">•</span>
                <span>{featuredNews.readTime}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-sidebar">
          <h3 className="sidebar-title">Trending Now</h3>
          {sideNews.map((news, index) => (
            <div key={index} className="sidebar-item">
              <span className="sidebar-category">{news.category}</span>
              <h4 className="sidebar-headline">{news.title}</h4>
              <span className="sidebar-time">{news.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
