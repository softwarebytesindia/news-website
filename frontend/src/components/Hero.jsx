const Hero = () => {
  const featuredNews = [
    {
      category: 'Technology',
      title: 'Revolutionary AI Breakthrough Promises to Transform Healthcare Industry',
      excerpt: 'Scientists develop new machine learning algorithm capable of detecting diseases years before symptoms appear.',
      date: 'March 18, 2026',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop'
    },
    {
      category: 'Business',
      title: 'Global Markets Rally as Economic Indicators Show Strong Growth',
      excerpt: 'Markets around the world surge as new economic data reveals unexpected strength.',
      date: 'March 17, 2026',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop'
    },
    {
      category: 'Science',
      title: 'NASA Announces Major Discovery on Mars Surface',
      excerpt: 'Space agency reveals groundbreaking findings from latest Mars mission.',
      date: 'March 16, 2026',
      image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=400&fit=crop'
    },
    {
      category: 'Politics',
      title: 'World Leaders Gather for Historic Climate Summit',
      excerpt: 'International leaders convene to address pressing environmental challenges.',
      date: 'March 15, 2026',
      image: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&h=400&fit=crop'
    }
  ];

  return (
    <section className="bg-gray-50 py-4 sm:py-6  sm:px-6 px-3 border-b border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredNews.map((news, index) => (
          <article key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-[3/2] overflow-hidden">
              <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <span className="absolute top-3 left-3 bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[7px] sm:text-[10px] font-semibold uppercase tracking-wide">{news.category}</span>
            </div>
            <div className="p-3">
              <h2 className="text-xs sm:text-sm font-bold leading-tight mb-2 tracking-tight line-clamp-2">
                <a href="/article" className="text-gray-900 no-underline hover:text-red-600 transition-colors duration-200">{news.title}</a>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>{news.date}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Hero;
