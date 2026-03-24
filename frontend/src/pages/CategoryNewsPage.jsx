import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta, NEWS_API_URL, formatNewsDate, getNewsPath, getNewsSummary, navigateTo, resolveMediaUrl } from '../utils/news';

const CategoryNewsPage = ({ categorySlug, subCategorySlug = null }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError('');

        const listingPath = subCategorySlug
          ? `${NEWS_API_URL}/listing/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subCategorySlug)}`
          : `${NEWS_API_URL}/listing/${encodeURIComponent(categorySlug)}`;

        const response = await fetch(listingPath);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load news');
        }

        setPageData(data);
      } catch (fetchError) {
        console.error('Error fetching category news:', fetchError);
        setError(fetchError.message || 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    if (!pageData) {
      return undefined;
    }

    const activeSection = pageData.subCategory || pageData.category || {};
    const sectionName = activeSection.name || 'News';
    const parentName = pageData.category?.name || '';
    const fallbackTitle = pageData.subCategory
      ? `${sectionName} | ${parentName} | New Bharat Digital`
      : `${sectionName} समाचार | New Bharat Digital`;
    const fallbackDescription = activeSection.description
      || `${sectionName} की ताजा खबरें और अपडेट पढ़ें New Bharat Digital पर।`;

    // Use first article's image as OG image for the category page
    const firstArticle = Array.isArray(pageData.news) ? pageData.news[0] : null;
    const imageUrl = firstArticle?.featuredImage?.url
      ? (firstArticle.featuredImage.url.startsWith('http')
          ? firstArticle.featuredImage.url
          : `${window.location.origin}${firstArticle.featuredImage.url}`)
      : `${window.location.origin}/news.webp`;

    return applySeoMeta({
      title: activeSection.seo?.metaTitle || fallbackTitle,
      description: activeSection.seo?.metaDescription || fallbackDescription,
      image: imageUrl,
      url: window.location.href,
      type: 'website',
      locale: 'hi_IN'
    });
  }, [pageData]);

  const category = pageData?.category || null;
  const subCategory = pageData?.subCategory || null;
  const articles = Array.isArray(pageData?.news) ? pageData.news : [];
  const latestNews = Array.isArray(pageData?.latestNews) ? pageData.latestNews : [];
  const breadcrumbItems = pageData ? [
    { label: 'Home', path: '/' },
    category ? { label: category.name, path: `/${category.slug}` } : null,
    subCategory ? { label: subCategory.name } : null
  ].filter(Boolean) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-1 px-3 py-6 sm:px-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-40 mb-5" />
              <div className="h-8 bg-gray-200 rounded w-56 mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-24 h-18 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_360px] gap-8 items-start">
              <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-8">
                <Breadcrumb items={breadcrumbItems} />
                <div className="mt-4 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {subCategory?.name || category?.name || 'News'}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {articles.length} article{articles.length === 1 ? '' : 's'} found.
                  </p>
                </div>

                {articles.length === 0 ? (
                  <p className="text-sm text-gray-500">No news found for this section.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {articles.map((article) => (
                      <a
                        key={article._id}
                        href={getNewsPath(article)}
                        onClick={(event) => {
                          event.preventDefault();
                          navigateTo(getNewsPath(article));
                        }}
                        className="group no-underline bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex gap-4"
                      >
                        <div className="w-28 sm:w-40 h-24 sm:h-28 bg-gray-100 flex-shrink-0 overflow-hidden">
                          {article.featuredImage?.url ? (
                            <img
                              src={resolveMediaUrl(article.featuredImage.url)}
                              alt={article.featuredImage.alt || article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : null}
                        </div>
                        <div className="py-3 pr-4 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mb-2">
                            <span className="font-semibold uppercase tracking-wide text-red-600">{article.category?.name || 'News'}</span>
                            {article.subCategory?.name ? <span>{article.subCategory.name}</span> : null}
                            <span>{formatNewsDate(article.createdAt)}</span>
                          </div>
                          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                            {article.title}
                          </h2>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-3">
                            {getNewsSummary(article)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </section>

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
                        onClick={(event) => {
                          event.preventDefault();
                          navigateTo(getNewsPath(item));
                        }}
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
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryNewsPage;
