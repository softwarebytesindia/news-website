import { useState, useEffect } from 'react';
import NewsFormPopup from '../components/NewsFormPopup';

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

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
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage News</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Add News
        </button>
      </div>

      <NewsFormPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        onSuccess={fetchNews}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">
                    <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.description}</p>
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.category?.name || 'N/A'}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full ${
                      item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-[10px] md:text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
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
