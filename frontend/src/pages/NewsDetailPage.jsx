import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { NEWS_API_URL, formatNewsDate, getNewsPath, getNewsSummary, resolveMediaUrl } from '../utils/news';

const NewsDetailPage = ({ categorySlug, subCategorySlug = null, slug }) => {
  const [article, setArticle] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError('');

        const articlePath = subCategorySlug
          ? `${NEWS_API_URL}/path/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subCategorySlug)}/${encodeURIComponent(slug)}`
          : `${NEWS_API_URL}/path/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`;

        const [articleResponse, latestResponse] = await Promise.all([
          fetch(articlePath),
          fetch(`${NEWS_API_URL}?status=published&limit=8`)
        ]);

        const [articleData, latestData] = await Promise.all([
          articleResponse.json(),
          latestResponse.json()
        ]);

        if (!articleResponse.ok) {
          throw new Error(articleData.error || 'Failed to load article');
        }

        if (!latestResponse.ok) {
          throw new Error('Failed to load latest news');
        }

        setArticle(articleData.news || null);
        setLatestNews(
          Array.isArray(latestData)
            ? latestData.filter((item) => item.slug !== slug).slice(0, 8)
            : []
        );
      } catch (fetchError) {
        console.error('Error fetching article:', fetchError);
        setError(fetchError.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [categorySlug, subCategorySlug, slug]);

  useEffect(() => {
    if (!article) {
      return undefined;
    }

    const previousTitle = document.title;
    document.title = article.seo?.metaTitle || article.title;

    return () => {
      document.title = previousTitle;
    };
  }, [article]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-1 px-3 py-6 sm:px-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
              <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <a href="/" className="text-sm text-red-600 no-underline hover:text-red-700">Back to home</a>
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          ) : article ? (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_360px] gap-8 items-start">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden text-left">
                {article.featuredImage?.url ? (
                  <div className="px-5 sm:px-8 pt-5 sm:pt-8">
                    <img
                      src={resolveMediaUrl(article.featuredImage.url)}
                      alt={article.featuredImage.alt || article.title}
                      className="w-full aspect-[16/9] object-cover rounded-2xl"
                    />
                  </div>
                ) : null}

                <div className="p-5 sm:p-8">
                  <a href="/" className="text-sm text-red-600 no-underline hover:text-red-700">Back to home</a>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-3 py-1 font-semibold">
                      {article.category?.name || 'News'}
                    </span>
                    <span>{formatNewsDate(article.createdAt)}</span>
                    {article.author?.name ? <span>By {article.author.name}</span> : null}
                  </div>
                  <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    {article.title}
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 leading-7">
                    {getNewsSummary(article)}
                  </p>
                </div>

                <div className="px-5 sm:px-8 pb-8">
                  <div
                    className="news-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              </article>

              <aside className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 xl:sticky xl:top-24">
                <div className="mb-5 pb-3 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
                </div>

                {latestNews.length === 0 ? (
                  <p className="text-sm text-gray-500">No latest news found.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {latestNews.map((item) => (
                      <a
                        key={item._id}
                        href={getNewsPath(item)}
                        className="group no-underline flex items-start gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="w-24 h-18 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.featuredImage?.url ? (
                            <img
                              src={resolveMediaUrl(item.featuredImage.url)}
                              alt={item.featuredImage.alt || item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                            <span className="font-semibold uppercase tracking-wide text-red-600">{item.category?.name || 'News'}</span>
                            <span>{formatNewsDate(item.createdAt)}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {getNewsSummary(item)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
