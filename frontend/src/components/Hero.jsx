import './Hero.css';

const Hero = () => {
  const featuredNews = {
    category: 'Technology',
    title: 'Revolutionary AI Breakthrough Promises to Transform Healthcare Industry',
    excerpt: 'Scientists develop new machine learning algorithm capable of detecting diseases years before symptoms appear, potentially saving millions of lives worldwide.',
    author: 'Sarah Johnson',
    date: 'March 18, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop'
  };

  const secondaryNews = [
    {
      category: 'Business',
      title: 'Global Markets Rally as Economic Indicators Show Strong Growth',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop'
    },
    {
      category: 'Science',
      title: 'NASA Announces Major Discovery on Mars Surface',
      image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=400&fit=crop'
    }
  ];

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-main">
          <article className="hero-featured">
            <div className="hero-image-wrapper">
              <img src={featuredNews.image} alt={featuredNews.title} className="hero-image" />
              <span className="hero-category">{featuredNews.category}</span>
            </div>
            <div className="hero-content">
              <h1 className="hero-title">
                <a href="/article">{featuredNews.title}</a>
              </h1>
              <p className="hero-excerpt">{featuredNews.excerpt}</p>
              <div className="hero-meta">
                <span className="hero-author">{featuredNews.author}</span>
                <span className="hero-divider">•</span>
                <span className="hero-date">{featuredNews.date}</span>
                <span className="hero-divider">•</span>
                <span className="hero-read-time">{featuredNews.readTime}</span>
              </div>
            </div>
          </article>
        </div>

        <div className="hero-sidebar">
          <h3 className="sidebar-title">Trending Now</h3>
          {secondaryNews.map((news, index) => (
            <article key={index} className="hero-secondary">
              <div className="secondary-image-wrapper">
                <img src={news.image} alt={news.title} className="secondary-image" />
                <span className="secondary-category">{news.category}</span>
              </div>
              <h4 className="secondary-title">
                <a href="/article">{news.title}</a>
              </h4>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
