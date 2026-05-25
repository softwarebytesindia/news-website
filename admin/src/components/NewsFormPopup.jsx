import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import HindiInput from './HindiInput';
import {
  API_BASE_URL,
  AUTHORS_API_URL,
  CATEGORIES_API_URL,
  NEWS_API_URL,
  SUBCATEGORIES_API_URL,
  UPLOAD_IMAGE_API_URL,
} from '../utils/api';
const STATUS_OPTIONS = ['draft', 'review', 'scheduled', 'published', 'archived'];

const HINDI_FONTS = [
  { name: 'Hind',                  label: 'हिंद',        style: 'Hind' },
  { name: 'Mukta',                 label: 'मुक्ता',      style: 'Mukta' },
  { name: 'Noto Serif Devanagari', label: 'नोटो सेरिफ़', style: 'Noto Serif Devanagari' },
  { name: 'Baloo 2',               label: 'बालू',        style: 'Baloo 2' },
  { name: 'Yatra One',             label: 'यात्रा',      style: 'Yatra One' },
  { name: 'Kalam',                 label: 'कलम',         style: 'Kalam' },
];

const getInitialFormData = (newsItem = null) => ({
  title: newsItem?.title || '',
  slug: newsItem?.slug || '',
  excerpt: newsItem?.excerpt || '',
  content: newsItem?.content || '',
  featuredImageUrl: newsItem?.featuredImage?.url || '',
  featuredImageJpgUrl: newsItem?.featuredImage?.jpgUrl || '',
  featuredImageAlt: newsItem?.featuredImage?.alt || '',
  category: newsItem?.category?._id || newsItem?.category || '',
  subCategory: newsItem?.subCategory?._id || newsItem?.subCategory || '',
  author: newsItem?.author?._id || newsItem?.author || '',
  tags: Array.isArray(newsItem?.tags) ? newsItem.tags.join(', ') : '',
  status: newsItem?.status || 'published',
  isBreaking: Boolean(newsItem?.isBreaking),
  metaTitle: newsItem?.seo?.metaTitle || '',
  metaDescription: newsItem?.seo?.metaDescription || '',
  location: newsItem?.location || '',
  priority: newsItem?.priority ?? 0,
  hindiTitle: newsItem?.hindiTitle || '',
  hindiContent: newsItem?.hindiContent || '',
  hindiFont: newsItem?.hindiFont || 'Hind'
});

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

/* ── Sidebar section wrapper ── */
const SideSection = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

/* ── Sidebar field label ── */
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>
);

/* ── Shared input class ── */
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

const NewsFormPopup = ({ isOpen, onClose, onSuccess, newsItem }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (!isOpen) return;
    setFormData(getInitialFormData(newsItem));
    setImageFile(null);

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [cRes, sRes, aRes] = await Promise.all([
          fetch(CATEGORIES_API_URL, { cache: 'no-cache' }),
          fetch(SUBCATEGORIES_API_URL, { cache: 'no-cache' }),
          fetch(AUTHORS_API_URL, { cache: 'no-cache' })
        ]);
        if (!cRes.ok || !sRes.ok || !aRes.ok) throw new Error('Failed to load form options');
        const [cData, sData, aData] = await Promise.all([cRes.json(), sRes.json(), aRes.json()]);
        setCategories(Array.isArray(cData) ? cData : []);
        setSubCategories(Array.isArray(sData) ? sData : []);
        setAuthors(Array.isArray(aData) ? aData : []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load categories, subcategories, or authors');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [isOpen, newsItem]);

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return resolveMediaUrl(formData.featuredImageUrl);
  }, [formData.featuredImageUrl, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imageFile, imagePreview]);

  const update = (field, value) => setFormData(cur => ({ ...cur, [field]: value }));

  const filteredSubCategories = subCategories.filter(item => {
    const parentId = item.category?._id || item.category;
    return parentId === formData.category;
  });

  const handleClose = () => {
    setImageFile(null);
    setFormData(getInitialFormData());
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let featuredImageUrl = formData.featuredImageUrl.trim();
      let featuredImageJpgUrl = formData.featuredImageJpgUrl.trim();

      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const res = await fetch(UPLOAD_IMAGE_API_URL, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Image upload failed');
        featuredImageUrl = data.avifPath || data.filePath || featuredImageUrl;
        featuredImageJpgUrl = data.jpgPath || featuredImageJpgUrl;
      }

      const payload = {
        title: formData.hindiTitle.trim(),
        slug: formData.slug.trim(),
        content: formData.hindiContent.trim(),
        featuredImage: { url: featuredImageUrl, jpgUrl: featuredImageJpgUrl, alt: formData.featuredImageAlt.trim() },
        category: formData.category,
        subCategory: formData.subCategory || null,
        author: formData.author || null,
        tags: formData.tags,
        status: formData.status,
        isBreaking: formData.isBreaking,
        seo: { metaTitle: formData.metaTitle.trim(), metaDescription: formData.metaDescription.trim() },
        location: formData.location.trim(),
        priority: Number(formData.priority) || 0,
        hindiTitle: formData.hindiTitle.trim(),
        hindiContent: formData.hindiContent.trim(),
        hindiFont: formData.hindiFont
      };

      const url = newsItem ? `${NEWS_API_URL}/${newsItem._id}` : NEWS_API_URL;
      const method = newsItem ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to save news');

      toast.success(newsItem ? 'News updated successfully' : 'News created successfully');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save news');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* Root: scrollable on mobile, fixed+flex on desktop */
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 overflow-y-auto md:overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold">
            {newsItem ? '✏' : '+'}
          </span>
          {newsItem ? 'Edit News' : 'Add News'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            form="news-form"
            type="submit"
            disabled={uploading || loadingOptions}
            className="px-5 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {uploading ? 'Saving…' : newsItem ? 'Update News' : 'Publish News'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden">

        {/* ══ LEFT — Main content area ══ */}
        <main className="md:flex-1 md:overflow-y-auto p-5 md:p-8">
          <form id="news-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">

            {/* 1. Font Picker */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Font style:</p>
              <div className="flex flex-wrap gap-2">
                {HINDI_FONTS.map(font => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => update('hindiFont', font.name)}
                    title={font.name}
                    className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                      formData.hindiFont === font.name
                        ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-300 text-orange-800'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                    style={{ fontFamily: `'${font.style}', sans-serif`, fontSize: '1rem' }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-orange-500">*</span>
                <span className="ml-2 text-xs font-normal text-gray-400">(type in Hinglish → press Space to convert)</span>
              </label>
              <HindiInput
                value={formData.hindiTitle}
                onChange={val => update('hindiTitle', val)}
                placeholder="e.g. type 'namaskar duniya' → नमस्कार दुनिया"
                fontFamily={formData.hindiFont}
                className="w-full px-5 py-5 text-lg border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>



            {/* 4. Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Content <span className="text-orange-500">*</span>
              </label>
              <HindiInput
                value={formData.hindiContent}
                onChange={val => update('hindiContent', val)}
                multiline
                rows={24}
                placeholder="Write main article content here…"
                fontFamily={formData.hindiFont}
                toolbar
                className="w-full px-5 py-5 text-base border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>

            {/* 5. Mobile sidebar sections — shown below Content on mobile only */}
            <div className="md:hidden space-y-4">

              <SideSection title="Publish">
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    value={formData.status}
                    onChange={e => update('status', e.target.value)}
                    className={inputCls}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Priority</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={e => update('priority', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={e => update('isBreaking', e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-medium text-red-600">Breaking News</span>
                </label>
              </SideSection>

              <SideSection title="URL">
                <div>
                  <FieldLabel>Slug</FieldLabel>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => update('slug', e.target.value)}
                    className={inputCls}
                    placeholder="auto-generated if blank"
                  />
                </div>
              </SideSection>

              <SideSection title="Classification">
                <div>
                  <FieldLabel>Category *</FieldLabel>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(cur => ({ ...cur, category: e.target.value, subCategory: '' }))}
                    className={inputCls}
                    required
                    disabled={loadingOptions}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Subcategory</FieldLabel>
                  <select
                    value={formData.subCategory}
                    onChange={e => update('subCategory', e.target.value)}
                    className={inputCls}
                    disabled={loadingOptions || !formData.category}
                  >
                    <option value="">No Subcategory</option>
                    {filteredSubCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Author</FieldLabel>
                  <select
                    value={formData.author}
                    onChange={e => update('author', e.target.value)}
                    className={inputCls}
                    disabled={loadingOptions}
                  >
                    <option value="">No Author</option>
                    {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => update('location', e.target.value)}
                    className={inputCls}
                    placeholder="City or region"
                  />
                </div>
                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => update('tags', e.target.value)}
                    className={inputCls}
                    placeholder="Separate with commas"
                  />
                </div>
              </SideSection>

              <SideSection title="Featured Image">
                <div>
                  <FieldLabel>Upload Image</FieldLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <FieldLabel>Image Alt Text</FieldLabel>
                  <input
                    type="text"
                    value={formData.featuredImageAlt}
                    onChange={e => update('featuredImageAlt', e.target.value)}
                    className={inputCls}
                    placeholder="Describe the image"
                  />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={formData.featuredImageAlt || 'Preview'}
                    className="w-full aspect-video object-cover rounded-lg border border-gray-200 mt-1"
                  />
                )}
              </SideSection>

              <SideSection title="SEO">
                <div>
                  <FieldLabel>Meta Title</FieldLabel>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={e => update('metaTitle', e.target.value)}
                    className={inputCls}
                    placeholder="Leave blank to use article title"
                  />
                </div>
                <div>
                  <FieldLabel>Meta Description</FieldLabel>
                  <textarea
                    value={formData.metaDescription}
                    onChange={e => update('metaDescription', e.target.value)}
                    className={`${inputCls} resize-none`}
                    rows={3}
                    placeholder="Short description for search engines"
                  />
                </div>
              </SideSection>

            </div>
            {/* end mobile sidebar sections */}

          </form>
        </main>

        {/* ══ RIGHT — Sidebar (desktop only) ══ */}
        <aside className="hidden md:block w-72 xl:w-80 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 space-y-4">

          {/* Publish */}
          <SideSection title="Publish">
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                value={formData.status}
                onChange={e => update('status', e.target.value)}
                className={inputCls}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <input
                type="number"
                min="0"
                value={formData.priority}
                onChange={e => update('priority', e.target.value)}
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBreaking}
                onChange={e => update('isBreaking', e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="font-medium text-red-600">Breaking News</span>
            </label>
          </SideSection>

          {/* Slug */}
          <SideSection title="URL">
            <div>
              <FieldLabel>Slug</FieldLabel>
              <input
                type="text"
                value={formData.slug}
                onChange={e => update('slug', e.target.value)}
                className={inputCls}
                placeholder="auto-generated if blank"
              />
            </div>
          </SideSection>

          {/* Classification */}
          <SideSection title="Classification">
            <div>
              <FieldLabel>Category *</FieldLabel>
              <select
                value={formData.category}
                onChange={e => setFormData(cur => ({ ...cur, category: e.target.value, subCategory: '' }))}
                className={inputCls}
                required
                disabled={loadingOptions}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Subcategory</FieldLabel>
              <select
                value={formData.subCategory}
                onChange={e => update('subCategory', e.target.value)}
                className={inputCls}
                disabled={loadingOptions || !formData.category}
              >
                <option value="">No Subcategory</option>
                {filteredSubCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Author</FieldLabel>
              <select
                value={formData.author}
                onChange={e => update('author', e.target.value)}
                className={inputCls}
                disabled={loadingOptions}
              >
                <option value="">No Author</option>
                {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <input
                type="text"
                value={formData.location}
                onChange={e => update('location', e.target.value)}
                className={inputCls}
                placeholder="City or region"
              />
            </div>
            <div>
              <FieldLabel>Tags</FieldLabel>
              <input
                type="text"
                value={formData.tags}
                onChange={e => update('tags', e.target.value)}
                className={inputCls}
                placeholder="Separate with commas"
              />
            </div>
          </SideSection>

          {/* Featured Image */}
          <SideSection title="Featured Image">
            <div>
              <FieldLabel>Upload Image</FieldLabel>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <FieldLabel>Image Alt Text</FieldLabel>
              <input
                type="text"
                value={formData.featuredImageAlt}
                onChange={e => update('featuredImageAlt', e.target.value)}
                className={inputCls}
                placeholder="Describe the image"
              />
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt={formData.featuredImageAlt || 'Preview'}
                className="w-full aspect-video object-cover rounded-lg border border-gray-200 mt-1"
              />
            )}
          </SideSection>

          {/* SEO */}
          <SideSection title="SEO">
            <div>
              <FieldLabel>Meta Title</FieldLabel>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={e => update('metaTitle', e.target.value)}
                className={inputCls}
                placeholder="Leave blank to use article title"
              />
            </div>
            <div>
              <FieldLabel>Meta Description</FieldLabel>
              <textarea
                value={formData.metaDescription}
                onChange={e => update('metaDescription', e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Short description for search engines"
              />
            </div>
          </SideSection>



        </aside>
      </div>
    </div>
  );
};

export default NewsFormPopup;
