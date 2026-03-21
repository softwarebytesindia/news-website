export const API_BASE_URL = 'http://localhost:5000';
export const NEWS_API_URL = `${API_BASE_URL}/api/news`;

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

export const formatNewsDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const sortBreakingNews = (articles = []) => [...articles].sort((first, second) => {
  const firstBreaking = new Date(first.breakingAt || first.createdAt || 0).getTime();
  const secondBreaking = new Date(second.breakingAt || second.createdAt || 0).getTime();

  if (secondBreaking !== firstBreaking) {
    return secondBreaking - firstBreaking;
  }

  const firstCreated = new Date(first.createdAt || 0).getTime();
  const secondCreated = new Date(second.createdAt || 0).getTime();
  return secondCreated - firstCreated;
});

export const getNewsSummary = (article) => (
  article?.excerpt
  || article?.seo?.metaDescription
  || 'Open the article to read the full story.'
);

export const getNewsPath = (article) => {
  const categorySlug = article?.category?.slug;
  const subCategorySlug = article?.subCategory?.slug;
  const articleSlug = article?.slug;

  if (!categorySlug || !articleSlug) {
    return '/';
  }

  return subCategorySlug
    ? `/${categorySlug}/${subCategorySlug}/${articleSlug}`
    : `/${categorySlug}/${articleSlug}`;
};

export const navigateTo = (path) => {
  if (!path || window.location.pathname === path) {
    return;
  }

  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

const ensureMetaTag = (name) => {
  let element = document.head.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  return element;
};

export const applySeoMeta = ({ title = '', description = '' }) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const previousTitle = document.title;
  const descriptionTag = ensureMetaTag('description');
  const previousDescription = descriptionTag.getAttribute('content') || '';

  document.title = title || previousTitle;
  descriptionTag.setAttribute('content', description || '');

  return () => {
    document.title = previousTitle;
    descriptionTag.setAttribute('content', previousDescription);
  };
};
