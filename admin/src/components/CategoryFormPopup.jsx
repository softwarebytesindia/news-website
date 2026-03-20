import { useState } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';

const CategoryFormPopup = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const API_URL = 'http://localhost:5000/api/categories';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      toast.success('Category created successfully');
      setFormData({ name: '', description: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Add Category">
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
    </Popup>
  );
};

export default CategoryFormPopup;
