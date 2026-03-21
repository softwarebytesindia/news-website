import { formatNewsDate, getNewsPath, getNewsSummary, resolveMediaUrl } from '../utils/news';

const LatestFeed = ({ articles, loading, error }) => (
  <section>
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 m-0 tracking-tight">Latest News</h2>
    </div>

    {loading ? (
      <div className="flex flex-col gap-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm flex items-center gap-4 w-full animate-pulse">
            <div className="w-20 h-14 sm:w-24 sm:h-16 bg-gray-200 flex-shrink-0" />
            <div className="flex-1 py-2 pr-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="bg-white rounded-lg p-5 text-sm text-red-600 shadow-sm">{error}</div>
    ) : articles.length === 0 ? (
      <div className="bg-white rounded-lg p-5 text-sm text-gray-500 shadow-sm">
        No non-breaking news is available right now.
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <a key={article._id} href={getNewsPath(article)} className="no-underline bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 w-full">
            <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden bg-gray-100">
              {article.featuredImage?.url ? (
                <img
                  src={resolveMediaUrl(article.featuredImage.url)}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 py-2 pr-3 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-[10px] sm:text-xs text-gray-400">
                <span className="font-semibold uppercase tracking-wide text-red-600">{article.category?.name || 'News'}</span>
                <span>{formatNewsDate(article.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold leading-tight mb-1 text-gray-900">{article.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-snug line-clamp-2 sm:line-clamp-3 m-0">
                {getNewsSummary(article)}
              </p>
            </div>
          </a>
        ))}
      </div>
    )}
  </section>
);

export default LatestFeed;
