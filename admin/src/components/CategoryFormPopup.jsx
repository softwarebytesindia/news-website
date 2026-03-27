import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';
import { CATEGORIES_API_URL } from '../utils/api';

const getInitialFormData = (category = null) => ({
  name: category?.name || '',
  description: category?.description || '',
  priority: category?.priority ?? 0,
  metaTitle: category?.seo?.metaTitle || '',
  metaDescription: category?.seo?.metaDescription || ''
});

const CategoryFormPopup = ({ isOpen, onClose, onSuccess, category }) => {
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(getInitialFormData(category));
  }, [isOpen, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(category ? `${CATEGORIES_API_URL}/${category._id}` : CATEGORIES_API_URL, {
        method: category ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priority: Number(formData.priority) || 0,
          seo: {
            metaTitle: formData.metaTitle.trim(),
            metaDescription: formData.metaDescription.trim()
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }

      toast.success(category ? 'Category updated successfully' : 'Category created successfully');
      setFormData(getInitialFormData());
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    onClose();
  };

  return (
    <Popup isOpen={isOpen} onClose={handleClose} title={category ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit} className="space-y-3">
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
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Priority</label>
          <input
            type="number"
            min="0"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Higher number shows first"
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

        <div className="border-t border-gray-200 pt-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">SEO</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SEO title for this category page"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="SEO description for this category page"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          {category ? 'Update Category' : 'Submit'}
        </button>
      </form>
    </Popup>
  );
};

export default CategoryFormPopup;
