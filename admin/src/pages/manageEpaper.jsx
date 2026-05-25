import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import EpaperFormPopup from '../components/EpaperFormPopup';
import { EPAPER_API_URL, resolveMediaUrl } from '../utils/api';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const ManageEpaper = () => {
  const [epapers, setEpapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEpapers();
  }, []);

  const fetchEpapers = async () => {
    setLoading(true);
    try {
      const res = await fetch(EPAPER_API_URL);
      const data = await res.json();
      setEpapers(data.epapers || []);
    } catch (error) {
      console.error('Error fetching epapers:', error);
      toast.error('Failed to load epapers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this epaper?')) return;
    try {
      const response = await fetch(`${EPAPER_API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete epaper');
      }
      toast.success('Epaper deleted successfully');
      fetchEpapers();
    } catch (error) {
      console.error('Error deleting epaper:', error);
      toast.error(error.message || 'Failed to delete epaper');
    }
  };

  const openCreatePopup = () => {
    setSelectedEpaper(null);
    setShowPopup(true);
  };

  const openEditPopup = (item) => {
    setSelectedEpaper(item);
    setShowPopup(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage Epaper</h1>
        <button
          onClick={openCreatePopup}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Upload Epaper
        </button>
      </div>

      <EpaperFormPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)}
        onSuccess={fetchEpapers}
        epaperItem={selectedEpaper}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Cover</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">PDF Link</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading epapers...</td>
                </tr>
              ) : epapers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No epapers found. Upload your first edition!</td>
                </tr>
              ) : (
                epapers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {paper.coverImage ? (
                        <img 
                          src={resolveMediaUrl(paper.coverImage)} 
                          alt="Cover" 
                          className="h-14 w-10 object-cover rounded border shadow-sm"
                        />
                      ) : (
                        <div className="h-14 w-10 bg-gray-100 rounded border flex items-center justify-center text-[10px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatDate(paper.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {paper.title || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={resolveMediaUrl(paper.pdfUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View PDF
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openEditPopup(paper)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(paper._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEpaper;
