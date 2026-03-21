import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import NewsFormPopup from '../components/NewsFormPopup';

const API_BASE_URL = 'http://localhost:5000';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const sortBreakingNews = (items) => [...items].sort((first, second) => {
  const firstBreaking = new Date(first.breakingAt || first.createdAt || 0).getTime();
  const secondBreaking = new Date(second.breakingAt || second.createdAt || 0).getTime();

  if (secondBreaking !== firstBreaking) {
    return secondBreaking - firstBreaking;
  }

  return new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
});

const formatStatusLabel = (status) => {
  if (!status) return 'Draft';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const API_URL = 'http://localhost:5000/api/news';

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete news');
      }
      toast.success('News deleted successfully');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error(error.message || 'Failed to delete news');
    }
  };

  const handleToggleBreaking = async (item, isBreaking) => {
    try {
      const response = await fetch(`${API_URL}/${item._id}/breaking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBreaking })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update breaking news');
      }

      toast.success(isBreaking ? 'Moved to breaking news' : 'Removed from breaking news');
      fetchNews();
    } catch (error) {
      console.error('Error updating breaking news:', error);
      toast.error(error.message || 'Failed to update breaking news');
    }
  };

  const openCreatePopup = () => {
    setSelectedNews(null);
    setShowPopup(true);
  };

  const openEditPopup = (item) => {
    setSelectedNews(item);
    setShowPopup(true);
  };

  const closePopup = () => {
    setSelectedNews(null);
    setShowPopup(false);
  };

  const breakingNews = sortBreakingNews(news.filter((item) => item.isBreaking)).slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage News</h1>
        <button
          onClick={openCreatePopup}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Add News
        </button>
      </div>

      <NewsFormPopup 
        isOpen={showPopup} 
        onClose={closePopup}
        onSuccess={fetchNews}
        newsItem={selectedNews}
      />

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Current Breaking News</h2>
            <p className="text-xs text-gray-500">Only the newest 4 breaking stories stay in the hero section. Promoting another story automatically demotes the oldest one.</p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 w-fit">
            {breakingNews.length}/4 active
          </span>
        </div>

        {breakingNews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
            No breaking news selected yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {breakingNews.map((item, index) => (
              <article key={item._id} className="rounded-xl border border-red-100 bg-red-50/40 overflow-hidden">
                <div className="relative h-36 bg-gray-100">
                  {item.featuredImage?.url ? (
                    <img
                      src={resolveMediaUrl(item.featuredImage.url)}
                      alt={item.featuredImage.alt || item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-red-600 text-white text-[10px] font-semibold px-2 py-1">
                    #{index + 1} Breaking
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-red-700 font-semibold">{item.category?.name || 'Uncategorized'}</span>
                    <span className="text-[10px] text-gray-500">{formatStatusLabel(item.status)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.excerpt || item.seo?.metaDescription || 'No summary added.'}</p>
                  <p className="text-[10px] text-gray-500">Pinned: {formatDate(item.breakingAt || item.createdAt)}</p>
                  <button
                    type="button"
                    onClick={() => handleToggleBreaking(item, false)}
                    className="w-full rounded-lg border border-red-200 bg-white text-red-700 text-xs font-medium px-3 py-2 hover:bg-red-50"
                  >
                    Remove From Breaking
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">
                    {item.featuredImage?.url ? (
                      <img
                        src={resolveMediaUrl(item.featuredImage.url)}
                        alt={item.featuredImage.alt || item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500">No Img</div>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.excerpt}</p>
                    {item.isBreaking && (
                      <span className="mt-1 inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full bg-red-100 text-red-700">
                        Breaking #{breakingNews.findIndex((newsItem) => newsItem._id === item._id) + 1 || ''}
                      </span>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    <div>{item.category?.name || 'N/A'}</div>
                    {item.subCategory?.name ? (
                      <div className="text-[10px] md:text-xs text-gray-500">{item.subCategory.name}</div>
                    ) : null}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.author?.name || 'N/A'}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'review'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'archived'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formatStatusLabel(item.status)}
                    </span>
                    {item.isBreaking && (
                      <span className="ml-2 inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full bg-red-100 text-red-700">
                        Breaking
                      </span>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditPopup(item)}
                        className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleBreaking(item, !item.isBreaking)}
                        className={`text-[10px] md:text-xs ${item.isBreaking ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'}`}
                      >
                        {item.isBreaking ? 'Remove Breaking' : 'Make Breaking'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-[10px] md:text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
                    No news found. Add your first news!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageNews;
