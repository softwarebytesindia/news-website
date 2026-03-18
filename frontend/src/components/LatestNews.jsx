const LatestNews = () => {
  const articles = [
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
    },
    {
      category: 'Science',
      title: 'NASA Reveals New Findings from Mars Mission',
      excerpt: 'Space agency announces breakthrough discovery that could change our understanding of the red planet.',
      image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=250&fit=crop',
      time: '6 hours ago'
    },
    {
      category: 'Health',
      title: 'New Vaccine Shows Promise Against Multiple Variants',
      excerpt: 'Clinical trials demonstrate effectiveness across different strains of the virus.',
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=250&fit=crop',
      time: '8 hours ago'
    },
    {
      category: 'Sports',
      title: 'Championship Finals Set to Break Viewership Records',
      excerpt: 'Major sporting event expected to draw largest global audience in history.',
      image: 'https://images.unsplash.com/photo-1461896836934- voices-ef2f8a7?w=400&h=250&fit=crop',
      time: '10 hours ago'
    },
    {
      category: 'Entertainment',
      title: 'Award Season Announces Surprising Nominations',
      excerpt: 'This year nominees include several independent films and breakthrough performances.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=250&fit=crop',
      time: '12 hours ago'
    },
    {
      category: 'Technology',
      title: 'Electric Vehicles Sales Surge Globally',
      excerpt: 'Automotive industry sees unprecedented shift toward sustainable transportation.',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop',
      time: '14 hours ago'
    }
  ];

  return (
    <section>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 m-0 tracking-tight">Latest News</h2>
        <a href="/latest" className="text-red-600 no-underline text-xs sm:text-sm font-semibold hover:text-red-700 transition-colors duration-200">View All →</a>
      </div>
      <div className="flex flex-col gap-3">
        {articles.map((article, articleIndex) => (
          <article key={articleIndex} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 w-full">
            <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
              <div className="flex-1 py-2 pr-3 min-w-0">
              <h3 className="text-sm font-bold leading-tight mb-1">
                <a href="/article" className="text-gray-900 no-underline hover:text-red-600 transition-colors duration-200">{article.title}</a>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-snug line-clamp-2 sm:line-clamp-3 m-0">{article.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;
