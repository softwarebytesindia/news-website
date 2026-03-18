import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LatestNews from '../components/LatestNews';
import Footer from '../components/Footer';

const Home = () => {
  const newsSections = [
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      
      <main className="flex-1 bg-gray-100 sm:py-10 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
            <div className="xl:col-span-3 flex flex-col gap-8">
              <LatestNews />
              {newsSections.map((section, index) => (
                <section key={index}>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 m-0 tracking-tight">{section.title}</h2>
                    <a href={section.viewAll} className="text-red-600 no-underline text-xs sm:text-sm font-semibold hover:text-red-700 transition-colors duration-200">View All →</a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.articles.map((article, articleIndex) => (
                      <article key={articleIndex} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          <span className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-semibold uppercase">{article.category}</span>
                        </div>
                        <div className="p-5">
                          <h3 className="text-base font-bold leading-snug mb-2.5 m-0">
                            <a href="/article" className="text-gray-900 no-underline hover:text-red-600 transition-colors duration-200">{article.title}</a>
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-500 mb-3 line-clamp-2">{article.excerpt}</p>
                          <span className="text-xs text-gray-400">{article.time}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="flex flex-col gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 m-0 pb-3 border-b-2 border-red-600 mb-5">Trending Topics</h3>
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {trendingTopics.map((topic, index) => (
                    <li key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <a href={`/search?q=${encodeURIComponent(topic.name)}`} className="flex items-start gap-3 no-underline transition-colors duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg">
                        <span className="w-7 h-7 bg-red-600 text-white rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0">{index + 1}</span>
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900 font-semibold text-sm">{topic.name}</span>
                          <span className="text-gray-400 text-xs">{topic.count}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm min-h-[280px] flex items-center justify-center">
                <div className="w-full h-[250px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">
                  Advertisement
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
