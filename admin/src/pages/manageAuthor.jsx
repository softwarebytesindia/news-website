import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthorFormPopup from '../components/AuthorFormPopup';
import { AUTHORS_API_URL, resolveMediaUrl } from '../utils/api';

const ManageAuthor = () => {
  const [authors, setAuthors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch(AUTHORS_API_URL);
      const data = await response.json();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to fetch authors');
    }
  };

  const openCreatePopup = () => {
    setSelectedAuthor(null);
    setShowPopup(true);
  };

  const openEditPopup = (author) => {
    setSelectedAuthor(author);
    setShowPopup(true);
  };

  const closePopup = () => {
    setSelectedAuthor(null);
    setShowPopup(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      const response = await fetch(`${AUTHORS_API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete author');
      }

      toast.success('Author deleted successfully');
      fetchAuthors();
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error(error.message || 'Failed to delete author');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage Authors</h1>
        <button
          onClick={openCreatePopup}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Add Author
        </button>
      </div>

      <AuthorFormPopup
        isOpen={showPopup}
        onClose={closePopup}
        onSuccess={fetchAuthors}
        authorItem={selectedAuthor}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Avatar</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Bio</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {authors.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">
                    {item.avatar ? (
                      <img
                        src={resolveMediaUrl(item.avatar)}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <p className="text-xs md:text-sm font-medium text-gray-900">{item.name}</p>
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 max-w-md">
                    <p className="line-clamp-2">{item.bio || 'No bio added'}</p>
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
                        onClick={() => handleDelete(item._id)}
                        className="text-[10px] md:text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
                    No authors found. Add your first author!
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

export default ManageAuthor;
