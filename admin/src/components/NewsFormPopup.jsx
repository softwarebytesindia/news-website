import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';
import RichTextEditor from './RichTextEditor';

const API_BASE_URL = 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/news`;
const CAT_API_URL = `${API_BASE_URL}/api/categories`;
const SUBCATEGORY_API_URL = `${API_BASE_URL}/api/subcategories`;
const AUTHOR_API_URL = `${API_BASE_URL}/api/authors`;
const UPLOAD_URL = `${API_BASE_URL}/api/upload/image`;
const STATUS_OPTIONS = ['draft', 'review', 'scheduled', 'published', 'archived'];

const getInitialFormData = (newsItem = null) => ({
  title: newsItem?.title || '',
  slug: newsItem?.slug || '',
  excerpt: newsItem?.excerpt || '',
  content: newsItem?.content || '',
  featuredImageUrl: newsItem?.featuredImage?.url || '',
  featuredImageAlt: newsItem?.featuredImage?.alt || '',
  category: newsItem?.category?._id || newsItem?.category || '',
  subCategory: newsItem?.subCategory?._id || newsItem?.subCategory || '',
  author: newsItem?.author?._id || newsItem?.author || '',
  tags: Array.isArray(newsItem?.tags) ? newsItem.tags.join(', ') : '',
  status: newsItem?.status || 'draft',
  isBreaking: Boolean(newsItem?.isBreaking),
  metaTitle: newsItem?.seo?.metaTitle || '',
  metaDescription: newsItem?.seo?.metaDescription || '',
  keywords: Array.isArray(newsItem?.seo?.keywords) ? newsItem.seo.keywords.join(', ') : '',
  location: newsItem?.location || '',
  priority: newsItem?.priority ?? 0
});

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

const NewsFormPopup = ({ isOpen, onClose, onSuccess, newsItem }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(getInitialFormData(newsItem));
    setImageFile(null);

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [categoriesRes, subCategoriesRes, authorsRes] = await Promise.all([
          fetch(CAT_API_URL),
          fetch(SUBCATEGORY_API_URL),
          fetch(AUTHOR_API_URL)
        ]);

        if (!categoriesRes.ok || !subCategoriesRes.ok || !authorsRes.ok) {
          throw new Error('Failed to load form options');
        }

        const [categoriesData, subCategoriesData, authorsData] = await Promise.all([
          categoriesRes.json(),
          subCategoriesRes.json(),
          authorsRes.json()
        ]);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setSubCategories(Array.isArray(subCategoriesData) ? subCategoriesData : []);
        setAuthors(Array.isArray(authorsData) ? authorsData : []);
      } catch (error) {
        console.error('Error fetching form options:', error);
        toast.error('Failed to load categories, subcategories, or authors');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen, newsItem]);

  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return resolveMediaUrl(formData.featuredImageUrl);
  }, [formData.featuredImageUrl, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const updateFormData = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const filteredSubCategories = subCategories.filter((item) => {
    const parentCategoryId = item.category?._id || item.category;
    return parentCategoryId === formData.category;
  });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleClose = () => {
    setImageFile(null);
    setFormData(getInitialFormData());
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setUploading(true);
      let featuredImageUrl = formData.featuredImageUrl.trim();

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const uploadRes = await fetch(UPLOAD_URL, {
          method: 'POST',
          body: uploadFormData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Image upload failed');
        }

        featuredImageUrl = uploadData.filePath || featuredImageUrl;
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        featuredImage: {
          url: featuredImageUrl,
          alt: formData.featuredImageAlt.trim()
        },
        category: formData.category,
        subCategory: formData.subCategory || null,
        author: formData.author || null,
        tags: formData.tags,
        status: formData.status,
        isBreaking: formData.isBreaking,
        seo: {
          metaTitle: formData.metaTitle.trim(),
          metaDescription: formData.metaDescription.trim(),
          keywords: formData.keywords
        },
        location: formData.location.trim(),
        priority: Number(formData.priority) || 0
      };

      const url = newsItem ? `${API_URL}/${newsItem._id}` : API_URL;
      const method = newsItem ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save news');
      }

      toast.success(newsItem ? 'News updated successfully' : 'News created successfully');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(error.message || 'Failed to save news');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      title={newsItem ? 'Edit News' : 'Add News'}
      panelClassName="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateFormData('title', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(event) => updateFormData('slug', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auto generated if left blank"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              min="0"
              value={formData.priority}
              onChange={(event) => updateFormData('priority', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Summary / Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(event) => updateFormData('excerpt', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Short summary for cards, previews, and snippet fallback"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Content</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => updateFormData('content', value)}
              placeholder="Write your article content here..."
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(event) => {
                const nextCategory = event.target.value;
                setFormData((current) => ({
                  ...current,
                  category: nextCategory,
                  subCategory: ''
                }));
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loadingOptions}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              value={formData.subCategory}
              onChange={(event) => updateFormData('subCategory', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingOptions || !formData.category}
            >
              <option value="">No Subcategory</option>
              {filteredSubCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>{subCategory.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Author</label>
            <select
              value={formData.author}
              onChange={(event) => updateFormData('author', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingOptions}
            >
              <option value="">No Author</option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>{author.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(event) => updateFormData('status', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(event) => updateFormData('location', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City or region"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(event) => updateFormData('tags', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Separate tags with commas"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Featured Image Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
            <input
              type="text"
              value={formData.featuredImageUrl}
              onChange={(event) => updateFormData('featuredImageUrl', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/uploads/image.jpg or https://..."
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
            <input
              type="text"
              value={formData.featuredImageAlt}
              onChange={(event) => updateFormData('featuredImageAlt', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {imagePreview && (
            <div className="md:col-span-2">
              <img
                src={imagePreview}
                alt={formData.featuredImageAlt || formData.title || 'Preview'}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="md:col-span-2 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">SEO</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(event) => updateFormData('metaTitle', event.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(event) => updateFormData('keywords', event.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Comma separated keywords"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(event) => updateFormData('metaDescription', event.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.isBreaking}
                onChange={(event) => updateFormData('isBreaking', event.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              Mark as breaking news
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || loadingOptions}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {uploading ? 'Saving...' : newsItem ? 'Update News' : 'Create News'}
          </button>
        </div>
      </form>
    </Popup>
  );
};

export default NewsFormPopup;
