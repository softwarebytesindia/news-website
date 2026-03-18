import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const newsSections = [
    {
      title: 'Latest News',
      viewAll: '/latest',
      articles: [
        {
          category: 'Technology',
          title: 'Tech Giants Report Record Earnings Amid AI Boom',
          excerpt: 'Major technology companies exceed quarterly expectations as artificial intelligence drives unprecedented growth.',
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop',
          time: '2 hours ago'
        },
        {
          category: 'Politics',
          title: 'Global Leaders Gather for Historic Climate Summit',
          excerpt: 'World leaders from 150 countries convene to address pressing environmental challenges and commit to carbon reduction.',
          image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop',
          time: '4 hours ago'
        },
        {
          category: 'Business',
          title: 'Stock Markets Reach All-Time Highs on Economic Optimism',
          excerpt: 'Global indices surge as new economic data suggests sustained growth trajectory.',
          image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop',
          time: '5 hours ago'
        }
      ]
    },
    {
      title: 'Featured Stories',
      viewAll: '/featured',
      articles: [
        {
          category: 'Science',
          title: 'Breakthrough in Renewable Energy Storage',
          excerpt: 'Scientists develop new battery technology that could revolutionize how we store solar and wind energy.',
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop',
          time: '1 day ago'
        },
        {
          category: 'Health',
          title: 'New Treatment Shows Promise for Rare Diseases',
          excerpt: 'Clinical trials reveal groundbreaking therapy that could help millions suffering from genetic conditions.',
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop',
          time: '2 days ago'
        },
        {
          category: 'Environment',
          title: 'Conservation Efforts Save Endangered Species',
          excerpt: 'Wildlife protection programs show remarkable success in reviving populations of at-risk animals.',
          image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop',
          time: '3 days ago'
        }
      ]
    }
  ];

  const trendingTopics = [
    { name: 'Artificial Intelligence', count: '2.4K articles' },
    { name: 'Climate Change', count: '1.8K articles' },
    { name: 'World Economy', count: '1.5K articles' },
    { name: 'Space Exploration', count: '1.2K articles' },
    { name: 'Healthcare Innovation', count: '980 articles' },
  ];

  return (
    <div className="home">
      <Navbar />
      <Hero />
      
      <main className="main-content">
        <div className="content-container">
          <div className="content-grid">
            <div className="news-sections">
              {newsSections.map((section, index) => (
                <section key={index} className="news-section">
                  <div className="section-header">
                    <h2 className="section-title">{section.title}</h2>
                    <a href={section.viewAll} className="view-all">View All →</a>
                  </div>
                  <div className="articles-grid">
                    {section.articles.map((article, articleIndex) => (
                      <article key={articleIndex} className="news-card">
                        <div className="card-image-wrapper">
                          <img src={article.image} alt={article.title} className="card-image" />
                          <span className="card-category">{article.category}</span>
                        </div>
                        <div className="card-content">
                          <h3 className="card-title">
                            <a href="/article">{article.title}</a>
                          </h3>
                          <p className="card-excerpt">{article.excerpt}</p>
                          <span className="card-time">{article.time}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="sidebar">
              <div className="sidebar-widget">
                <h3 className="widget-title">Trending Topics</h3>
                <ul className="trending-list">
                  {trendingTopics.map((topic, index) => (
                    <li key={index} className="trending-item">
                      <a href={`/search?q=${encodeURIComponent(topic.name)}`} className="trending-link">
                        <span className="trending-rank">{index + 1}</span>
                        <div className="trending-content">
                          <span className="trending-name">{topic.name}</span>
                          <span className="trending-count">{topic.count}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-widget ad-widget">
                <div className="ad-placeholder">
                  <span>Advertisement</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
