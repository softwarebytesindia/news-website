import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryFormPopup from '../components/CategoryFormPopup';
import { CATEGORIES_API_URL } from '../utils/api';

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API_URL, { cache: 'no-cache' });
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`${CATEGORIES_API_URL}/${id}`, { method: 'DELETE' });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const category = categories.find(c => c._id === id);
      await fetch(`${CATEGORIES_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: !currentStatus }),
      });
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage Categories</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowPopup(true);
          }}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          + Add Category
        </button>
      </div>

      <CategoryFormPopup 
        isOpen={showPopup} 
        onClose={() => {
          setShowPopup(false);
          setSelectedCategory(null);
        }} 
        onSuccess={fetchCategories}
        category={selectedCategory}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">
                    <p className="text-xs md:text-sm font-medium text-gray-900">{item.name}</p>
                    {item.description && (
                      <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.slug}
                  </td>
                  <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {item.priority ?? 0}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <button
                      onClick={() => toggleActive(item._id, item.isActive)}
                      className={`inline-flex px-1.5 py-0.5 text-[10px] md:text-xs rounded-full cursor-pointer ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedCategory(item);
                          setShowPopup(true);
                        }}
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
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
                    No categories found. Add your first category!
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

export default ManageCategory;
