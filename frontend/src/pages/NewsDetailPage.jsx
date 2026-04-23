import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialBar, { TopShareBar } from '../components/SocialBar';
import CommentsSection from '../components/CommentsSection';
import { applySeoMeta, NEWS_API_URL, formatNewsDate, getFeaturedImageJpgUrl, getFeaturedImageUrl, getNewsPath, getNewsSummary, navigateTo, useFeaturedImageFallback, linkifyHtml } from '../utils/news';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

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

    const imageUrl = getFeaturedImageJpgUrl(article) || getFeaturedImageUrl(article);
    const canonicalUrl = window.location.origin + window.location.pathname;
    const plainContent = stripHtml(article.content || '');
    const description = article.seo?.metaDescription || article.excerpt || (plainContent.length > 160 ? plainContent.slice(0, 160) + '...' : plainContent);

    const cleanup = applySeoMeta({
      title: article.seo?.metaTitle || article.hindiTitle || article.title,
      description,
      image: imageUrl,
      imageWidth: 1200,
      imageHeight: 630,
      url: canonicalUrl,
      type: 'article',
      locale: 'hi_IN',
      publishedTime: article.createdAt ? new Date(article.createdAt).toISOString() : '',
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : '',
      author: article.author?.name || 'New Bharat Digital',
      section: article.category?.name || '',
      tags: Array.isArray(article.tags) ? article.tags : []
    });

    // ── JSON-LD NewsArticle Structured Data ─────────────────────────────────
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description,
      image: imageUrl ? [imageUrl] : [],
      thumbnailUrl: imageUrl || undefined,
      datePublished: article.createdAt,
      dateModified: article.updatedAt || article.createdAt,
      author: article.author?.name
        ? [{ '@type': 'Person', name: article.author.name }]
        : [{ '@type': 'Organization', name: 'New Bharat Digital' }],
      publisher: {
        '@type': 'Organization',
        name: 'New Bharat Digital',
        logo: { '@type': 'ImageObject', url: `${window.location.origin}/news.webp` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      inLanguage: 'hi',
      articleSection: article.category?.name || '',
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      wordCount: plainContent.split(/\s+/).filter(Boolean).length,
      articleBody: plainContent.slice(0, 500),
    };

    let scriptEl = document.head.querySelector('script[data-type="news-jsonld"]');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('data-type', 'news-jsonld');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      cleanup();
      scriptEl?.remove();
    };
  }, [article]);

  const breadcrumbItems = article ? [
    { label: 'Home', path: '/' },
    article.category?.slug
      ? { label: article.category.name, path: `/${article.category.slug}` }
      : null,
    article.subCategory?.slug && article.category?.slug
      ? { label: article.subCategory.name, path: `/${article.category.slug}/${article.subCategory.slug}` }
      : null,
    { label: article.title }
  ].filter(Boolean) : [];

  const handleTagClick = (tag) => {
    navigateTo(`/search?q=${encodeURIComponent(tag)}`);
  };

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
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo('/');
                }}
                className="text-sm text-red-600 no-underline hover:text-red-700"
              >
                Back to home
              </a>
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          ) : article ? (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_360px] gap-8 items-start">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden text-left">
                {article.featuredImage?.url || article.featuredImage?.jpgUrl ? (
                  <div className="px-5 sm:px-8 pt-5 sm:pt-8">
                    {/* fetchpriority=high tells browser to load the hero image first (improves LCP) */}
                    <img
                      src={getFeaturedImageUrl(article)}
                      alt={article.featuredImage.alt || article.title}
                      onError={(event) => useFeaturedImageFallback(event, article)}
                      className="w-full aspect-[16/9] object-cover rounded-2xl"
                      fetchpriority="high"
                      width="1200"
                      height="675"
                      decoding="async"
                    />
                  </div>
                ) : null}

                <div className="p-5 sm:p-8">
                  <Breadcrumb items={breadcrumbItems} />
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-3 py-1 font-semibold">
                      {article.category?.name || 'News'}
                    </span>
                    <time dateTime={article.createdAt}>{formatNewsDate(article.createdAt)}</time>
                    {article.author?.name ? <span>By {article.author.name}</span> : null}
                  </div>
                  <h1
                    className="mt-4 text-xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight"
                    style={article.hindiFont ? { fontFamily: `'${article.hindiFont}', sans-serif` } : undefined}
                  >
                    {article.hindiTitle || article.title}
                  </h1>

                  {/* Top Share Bar */}
                  <TopShareBar title={article.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
                </div>

                <div className="px-5 sm:px-8 pb-8">
                  <div
                    className="news-content"
                    style={article.hindiFont ? { fontFamily: `'${article.hindiFont}', sans-serif` } : undefined}
                    dangerouslySetInnerHTML={{ __html: linkifyHtml(article.content) }}
                  />

                  {/* Tags — now rendered as clickable links for SEO internal linking */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 mb-6 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 mr-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Tags:
                      </span>
                      {article.tags.map((tag, index) => (
                        <a
                          key={index}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          onClick={(e) => { e.preventDefault(); handleTagClick(tag); }}
                          rel="tag"
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition-colors no-underline"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Social interaction bar */}
                  <SocialBar
                    title={article.title}
                    url={window.location.href}
                    slug={article.slug}
                  />

                  {/* Comment Section */}
                  <CommentsSection slug={article.slug} />
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
                        onClick={(event) => {
                          event.preventDefault();
                          navigateTo(getNewsPath(item));
                        }}
                        className="group no-underline flex items-start gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="w-24 h-18 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.featuredImage?.url || item.featuredImage?.jpgUrl ? (
                            <img
                              src={getFeaturedImageUrl(item)}
                              alt={item.featuredImage.alt || item.title}
                              onError={(event) => useFeaturedImageFallback(event, item)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              width="96"
                              height="72"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                            <span className="font-semibold uppercase tracking-wide text-red-600">{item.category?.name || 'News'}</span>
                            <time dateTime={item.createdAt}>{formatNewsDate(item.createdAt)}</time>
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
