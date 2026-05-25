import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { applySeoMeta, SEARCH_API_URL, formatNewsDate, getFeaturedImageUrl, getNewsPath, getNewsSummary, navigateTo, useFeaturedImageFallback } from '../utils/news';

const getQueryFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
};

const SearchPage = () => {
  const [query, setQuery] = useState(getQueryFromUrl);
  const [inputValue, setInputValue] = useState(getQueryFromUrl);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Re-read query when URL changes (e.g. tag click, browser back)
  useEffect(() => {
    const onPopState = () => {
      const q = getQueryFromUrl();
      setQuery(q);
      setInputValue(q);
      setPage(1);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Update SEO meta on every query change
  useEffect(() => {
    const pageTitle = query ? `Search: ${query}` : 'Search';
    const desc = query
      ? `${total} results for "${query}" on New Bharat Digital — ताजा हिंदी समाचार`
      : 'Search news articles on New Bharat Digital';
    return applySeoMeta({
      title: pageTitle,
      description: desc,
      url: window.location.origin + '/search' + (query ? `?q=${encodeURIComponent(query)}` : ''),
      type: 'website',
      robots: 'noindex, follow' // Crucial: don't index search result pages!
    });
  }, [query, total]);

  const fetchResults = useCallback(async (searchQuery, searchPage) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(
        `${SEARCH_API_URL}?q=${encodeURIComponent(searchQuery)}&page=${searchPage}&limit=12`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(Array.isArray(data.results) ? data.results : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query, page);
  }, [query, page, fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setPage(1);
    setQuery(trimmed);
    // Update URL without reload
    const newUrl = `/search?q=${encodeURIComponent(trimmed)}`;
    window.history.pushState({}, '', newUrl);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-1 px-3 py-6 sm:px-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Search News</h1>
            <form onSubmit={handleSearch} role="search" className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  id="search-input"
                  type="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="खबर खोजें... (Search news)"
                  aria-label="Search news articles"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base flex-shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results count */}
          {query && !loading && !error && (
            <p className="text-sm text-gray-500 mb-4 px-1">
              {total > 0
                ? `${total} result${total !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </p>
          )}

          {/* Loading state */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-28 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* No results */}
          {!loading && !error && query && results.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-500 text-sm">Try different keywords or browse categories from the menu.</p>
            </div>
          )}

          {/* Empty state — no query yet */}
          {!query && !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-gray-400 text-sm">Type something above to search for news articles.</p>
            </div>
          )}

          {/* Results list */}
          {!loading && !error && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((article) => (
                <a
                  key={article._id}
                  href={getNewsPath(article)}
                  onClick={(e) => { e.preventDefault(); navigateTo(getNewsPath(article)); }}
                  className="group no-underline bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex gap-4"
                >
                  <div className="w-28 sm:w-40 h-24 sm:h-28 bg-gray-100 flex-shrink-0 overflow-hidden rounded-l-xl">
                    {article.featuredImage?.url || article.featuredImage?.jpgUrl ? (
                      <img
                        src={getFeaturedImageUrl(article)}
                        alt={article.featuredImage.alt || article.title}
                        onError={(event) => useFeaturedImageFallback(event, article)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width="160"
                        height="112"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="py-3 pr-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mb-2">
                      <span className="font-semibold uppercase tracking-wide text-red-600">
                        {article.category?.name || 'News'}
                      </span>
                      {article.subCategory?.name && (
                        <span>{article.subCategory.name}</span>
                      )}
                      <time dateTime={article.createdAt}>{formatNewsDate(article.createdAt)}</time>
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {getNewsSummary(article)}
                    </p>
                    {Array.isArray(article.tags) && article.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Search results pages" className="flex justify-center items-center gap-2 mt-4 pt-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
