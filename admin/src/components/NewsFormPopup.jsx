import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';

const NewsFormPopup = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: '',
    category: '',
    author: 'Admin',
    isFeatured: false,
    isPublished: true,
  });

  const API_URL = 'http://localhost:5000/api/news';
  const CAT_API_URL = 'http://localhost:5000/api/categories';
  const UPLOAD_URL = 'http://localhost:5000/api/upload/image';

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CAT_API_URL);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imagePath = formData.image;

      if (imageFile) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);

        const uploadRes = await fetch(UPLOAD_URL, {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadData = await uploadRes.json();
        setUploading(false);

        if (uploadData.filePath) {
          imagePath = uploadData.filePath;
        }
      }

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: imagePath }),
      });

      toast.success('News created successfully');
      setFormData({
        title: '',
        description: '',
        content: '',
        image: '',
        category: '',
        author: 'Admin',
        isFeatured: false,
        isPublished: true,
      });
      setImageFile(null);
      setImagePreview('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating news:', error);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      description: '',
      content: '',
      image: '',
      category: '',
      author: 'Admin',
      isFeatured: false,
      isPublished: true,
    });
    onClose();
  };

  return (
    <Popup isOpen={isOpen} onClose={handleClose} title="Add News">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            required
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter image URL instead"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs md:text-sm">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-3 h-3 md:w-4 md:h-4 text-blue-600"
            />
            <span className="text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 text-xs md:text-sm">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-3 h-3 md:w-4 md:h-4 text-blue-600"
            />
            <span className="text-gray-700">Published</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </Popup>
  );
};

export default NewsFormPopup;
