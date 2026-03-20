import { useState, useEffect } from 'react';

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const API_URL = 'http://localhost:5000/api/categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const category = categories.find(c => c._id === id);
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: !currentStatus }),
      });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-base md:text-lg font-bold text-gray-800">Manage Categories</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Sports, Technology, Business"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase">Slug</th>
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
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-[10px] md:text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-4 py-6 text-center text-xs md:text-sm text-gray-500">
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
