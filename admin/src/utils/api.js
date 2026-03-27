export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const NEWS_API_URL = `${API_BASE_URL}/api/news`;
export const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories`;
export const SUBCATEGORIES_API_URL = `${API_BASE_URL}/api/subcategories`;
export const AUTHORS_API_URL = `${API_BASE_URL}/api/authors`;
export const UPLOAD_IMAGE_API_URL = `${API_BASE_URL}/api/upload/image`;

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};
