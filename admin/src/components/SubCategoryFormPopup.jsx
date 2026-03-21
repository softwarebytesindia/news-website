import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';

const CATEGORY_API_URL = 'http://localhost:5000/api/categories';
const SUBCATEGORY_API_URL = 'http://localhost:5000/api/subcategories';

const getInitialFormData = (subCategory = null) => ({
  category: subCategory?.category?._id || subCategory?.category || '',
  name: subCategory?.name || '',
  description: subCategory?.description || ''
});

const SubCategoryFormPopup = ({ isOpen, onClose, onSuccess, subCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(getInitialFormData(subCategory));

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(CATEGORY_API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load categories');
        }

        setCategories(Array.isArray(data) ? data.filter((item) => item.isActive) : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(error.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen, subCategory]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(subCategory ? `${SUBCATEGORY_API_URL}/${subCategory._id}` : SUBCATEGORY_API_URL, {
        method: subCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save subcategory');
      }

      toast.success(subCategory ? 'Subcategory updated successfully' : 'Subcategory created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose} title={subCategory ? 'Edit Subcategory' : 'Add Subcategory'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <select
            value={formData.category}
            onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
            className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Cricket, Bollywood News, Startups"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Optional description"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Saving...' : subCategory ? 'Update Subcategory' : 'Create Subcategory'}
        </button>
      </form>
    </Popup>
  );
};

export default SubCategoryFormPopup;
