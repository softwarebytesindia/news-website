import { formatNewsDate, getFeaturedImageUrl, getNewsPath, getNewsSummary, navigateTo, useFeaturedImageFallback } from '../utils/news';

const Hero = ({ articles, loading, error }) => (
  <section className="bg-gray-50 py-4 sm:py-6 sm:px-6 px-3 border-b border-gray-200">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Breaking News</h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-[3/2] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-6 text-sm text-red-600 shadow-sm">{error}</div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-sm text-gray-500 shadow-sm">
          No breaking news is selected right now.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((news) => (
            <a
              key={news._id}
              href={getNewsPath(news)}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(getNewsPath(news));
              }}
              className="block no-underline bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                {news.featuredImage?.url || news.featuredImage?.jpgUrl ? (
                  <img
                    src={getFeaturedImageUrl(news)}
                    alt={news.featuredImage.alt || news.title}
                    onError={(event) => useFeaturedImageFallback(event, news)}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    fetchpriority="high"
                    width="600"
                    height="400"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 via-white to-gray-100" />
                )}
                <span className="absolute top-3 left-3 bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[7px] sm:text-[10px] font-semibold uppercase tracking-wide">
                  {news.category?.name || 'News'}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-xs sm:text-sm font-bold leading-tight mb-2 tracking-tight line-clamp-2 text-gray-900">
                  {news.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-2">
                  {getNewsSummary(news)}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span>{formatNewsDate(news.breakingAt || news.createdAt)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default Hero;
