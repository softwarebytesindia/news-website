import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CategorySlider from '../components/CategorySlider';
import Hero from '../components/Hero';
import LatestFeed from '../components/LatestFeed';
import Footer from '../components/Footer';
import { applySeoMeta, NEWS_API_URL, SITE_URL, navigateTo, sortBreakingNews } from '../utils/news';

const NewsHome = () => {
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState('');

  // ── WebSite + SearchAction JSON-LD ────────────────────────────────────────
  // Enables Google Sitelinks Searchbox in search results
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'New Bharat Digital',
      url: SITE_URL,
      inLanguage: 'hi',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    let el = document.head.querySelector('script[data-type="website-jsonld"]');
    if (!el) {
      el = document.createElement('script');
      el.setAttribute('type', 'application/ld+json');
      el.setAttribute('data-type', 'website-jsonld');
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);
    return () => { el?.remove(); };
  }, []);

  useEffect(() => {
    return applySeoMeta({
      title: 'ताजा हिंदी समाचार — New Bharat Digital',
      description: 'ताजा खबरें, ब्रेकिंग न्यूज़ और सभी प्रमुख श्रेणियों की हिंदी समाचार अपडेट पढ़ें।',
      image: `${window.location.origin}/news.webp`,
      url: window.location.origin + '/',
      type: 'website',
      locale: 'hi_IN'
    });
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        setNewsError('');
        const response = await fetch(`${NEWS_API_URL}?status=published`);

        if (!response.ok) {
          throw new Error('Failed to load news');
        }

        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching homepage news:', error);
        setNewsError('Unable to load latest news right now.');
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  const breakingNews = sortBreakingNews(articles.filter((article) => article.isBreaking)).slice(0, 4);
  const latestNews = articles.filter((article) => !article.isBreaking);

  // ── Build real trending topics from the articles' tags ────────────────────
  const trendingTopics = (() => {
    const tagCount = {};
    articles.forEach((article) => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach((tag) => {
          if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([tag, count]) => ({ name: tag, count }));
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hidden H1 for SEO purposes (Homepage must have an H1) */}
      <h1 className="sr-only">New Bharat Digital — ताजा हिंदी समाचार | Breaking News</h1>

      <CategorySlider />
      <Hero articles={breakingNews} loading={loadingNews} error={newsError} />

      <main className="flex-1 bg-gray-100 sm:py-10 py-6 px-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
            <div className="xl:col-span-3 flex flex-col gap-8">
              <LatestFeed articles={latestNews} loading={loadingNews} error={newsError} />
            </div>

            <aside className="flex flex-col gap-6">
              {/* Real Trending Topics from article tags */}
              {trendingTopics.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 m-0 pb-3 border-b-2 border-red-600 mb-5">Trending Topics</h3>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3">
                    {trendingTopics.map((topic, index) => (
                      <li key={topic.name} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <a
                          href={`/search?q=${encodeURIComponent(topic.name)}`}
                          onClick={(e) => { e.preventDefault(); navigateTo(`/search?q=${encodeURIComponent(topic.name)}`); }}
                          className="flex items-start gap-3 no-underline transition-colors duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg"
                        >
                          <span className="w-7 h-7 bg-red-600 text-white rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0">{index + 1}</span>
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-900 font-semibold text-sm capitalize">{topic.name}</span>
                            <span className="text-gray-400 text-xs">{topic.count} article{topic.count !== 1 ? 's' : ''}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

export default NewsHome;
