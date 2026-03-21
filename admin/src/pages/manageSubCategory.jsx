import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SubCategoryFormPopup from '../components/SubCategoryFormPopup';

const SUBCATEGORY_API_URL = 'http://localhost:5000/api/subcategories';

const ManageSubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(SUBCATEGORY_API_URL);
      const data = await response.json();
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`${SUBCATEGORY_API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete subcategory');
      }

      toast.success('Subcategory deleted successfully');
      fetchSubCategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error(error.message || 'Failed to delete subcategory');
    }
  };

  const toggleActive = async (item) => {
    try {
      const response = await fetch(`${SUBCATEGORY_API_URL}/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: item.category?._id || item.category,
          name: item.name,
          description: item.description || '',
          isActive: !item.isActive
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subcategory');
      }

      toast.success(`Subcategory ${!item.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSubCategories();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error(error.message || 'Failed to update subcategory');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-800">Manage Subcategories</h1>
          <p className="text-xs md:text-sm text-gray-500">Create multiple subcategories under each category.</p>
        </div>
        <button
          onClick={() => {
            setSelectedSubCategory(null);
            setShowPopup(true);
          }}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Add Subcategory
        </button>
      </div>

      <SubCategoryFormPopup
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedSubCategory(null);
        }}
        onSuccess={fetchSubCategories}
        subCategory={selectedSubCategory}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Subcategory</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subCategories.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">
                    <p className="text-xs md:text-sm font-medium text-gray-900">{item.name}</p>
                    {item.description ? (
                      <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    ) : null}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.category?.name || 'N/A'}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.slug}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      className={`inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full cursor-pointer ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubCategory(item);
                          setShowPopup(true);
                        }}
                        className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-[10px] md:text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
                    No subcategories found. Add your first subcategory.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageSubCategory;
