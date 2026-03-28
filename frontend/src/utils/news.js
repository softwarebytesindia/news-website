export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const NEWS_API_URL = `${API_BASE_URL}/api/news`;
export const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories`;
export const SITE_NAME = 'New Bharat Digital';
export const SITE_URL = window.location.origin;

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
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

/* ── Meta tag helpers ── */

const ensureMetaName = (name) => {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  return el;
};

const ensureMetaProp = (property) => {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  return el;
};

const ensureLink = (rel, id) => {
  let el = document.head.querySelector(`link[rel="${rel}"]${id ? `[data-id="${id}"]` : ''}`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (id) el.setAttribute('data-id', id);
    document.head.appendChild(el);
  }
  return el;
};

/**
 * Securely converts plain text URLs within an HTML string into clickable <a> tags.
 * It uses DOMParser to traverse only text nodes, completely avoiding modification
 * of existing HTML attributes (like href or src) and skipping already-linked text.
 */
export const linkifyHtml = (html) => {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const urlRegex = /(https?:\/\/[^\s<]+)/g;

  const traverse = (node) => {
    // Skip interactive/existing link elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button' || tag === 'script' || tag === 'style') {
        return;
      }
      Array.from(node.childNodes).forEach(traverse);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (urlRegex.test(text)) {
        urlRegex.lastIndex = 0; // reset
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }
          
          const a = document.createElement('a');
          const url = match[0];
          
          // Remove trailing punctuation that might get caught if user typed "url.com,"
          const cleanUrl = url.replace(/[.,;!?]+$/, '');
          const punctuation = url.slice(cleanUrl.length);
          
          a.href = cleanUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'text-blue-600 hover:text-blue-800 underline break-words';
          a.textContent = cleanUrl;
          fragment.appendChild(a);
          
          if (punctuation) {
            fragment.appendChild(document.createTextNode(punctuation));
          }
          
          lastIndex = match.index + url.length;
        }

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        node.parentNode.replaceChild(fragment, node);
      }
    }
  };

  traverse(doc.body);
  return doc.body.innerHTML;
};

/**
 * applySeoMeta — sets all important SEO meta tags and returns a cleanup fn.
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.image]       - absolute image URL for OG/Twitter
 * @param {string} [opts.url]         - canonical URL (defaults to current href)
 * @param {'website'|'article'} [opts.type]
 * @param {string} [opts.locale]      - e.g. 'hi_IN'
 */
export const applySeoMeta = ({
  title = '',
  description = '',
  image = '',
  url = '',
  type = 'website',
  locale = 'hi_IN'
} = {}) => {
  if (typeof document === 'undefined') return () => {};

  const canonical = url || window.location.href;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Snapshot previous values for cleanup
  const prev = {
    title: document.title,
    description: ensureMetaName('description').getAttribute('content') || '',
    canonical: ensureLink('canonical', 'seo').getAttribute('href') || '',
    ogTitle: ensureMetaProp('og:title').getAttribute('content') || '',
    ogDesc: ensureMetaProp('og:description').getAttribute('content') || '',
    ogImage: ensureMetaProp('og:image').getAttribute('content') || '',
    ogUrl: ensureMetaProp('og:url').getAttribute('content') || '',
    ogType: ensureMetaProp('og:type').getAttribute('content') || '',
    ogLocale: ensureMetaProp('og:locale').getAttribute('content') || '',
    ogSiteName: ensureMetaProp('og:site_name').getAttribute('content') || '',
    twCard: ensureMetaName('twitter:card').getAttribute('content') || '',
    twTitle: ensureMetaName('twitter:title').getAttribute('content') || '',
    twDesc: ensureMetaName('twitter:description').getAttribute('content') || '',
    twImage: ensureMetaName('twitter:image').getAttribute('content') || '',
  };

  // Apply
  document.title = fullTitle;
  ensureMetaName('description').setAttribute('content', description);
  ensureLink('canonical', 'seo').setAttribute('href', canonical);

  // Open Graph
  ensureMetaProp('og:title').setAttribute('content', fullTitle);
  ensureMetaProp('og:description').setAttribute('content', description);
  ensureMetaProp('og:image').setAttribute('content', image);
  ensureMetaProp('og:url').setAttribute('content', canonical);
  ensureMetaProp('og:type').setAttribute('content', type);
  ensureMetaProp('og:locale').setAttribute('content', locale);
  ensureMetaProp('og:site_name').setAttribute('content', SITE_NAME);

  // Twitter Card
  ensureMetaName('twitter:card').setAttribute('content', image ? 'summary_large_image' : 'summary');
  ensureMetaName('twitter:title').setAttribute('content', fullTitle);
  ensureMetaName('twitter:description').setAttribute('content', description);
  ensureMetaName('twitter:image').setAttribute('content', image);

  // Cleanup fn
  return () => {
    document.title = prev.title;
    ensureMetaName('description').setAttribute('content', prev.description);
    ensureLink('canonical', 'seo').setAttribute('href', prev.canonical);
    ensureMetaProp('og:title').setAttribute('content', prev.ogTitle);
    ensureMetaProp('og:description').setAttribute('content', prev.ogDesc);
    ensureMetaProp('og:image').setAttribute('content', prev.ogImage);
    ensureMetaProp('og:url').setAttribute('content', prev.ogUrl);
    ensureMetaProp('og:type').setAttribute('content', prev.ogType);
    ensureMetaProp('og:locale').setAttribute('content', prev.ogLocale);
    ensureMetaProp('og:site_name').setAttribute('content', prev.ogSiteName);
    ensureMetaName('twitter:card').setAttribute('content', prev.twCard);
    ensureMetaName('twitter:title').setAttribute('content', prev.twTitle);
    ensureMetaName('twitter:description').setAttribute('content', prev.twDesc);
    ensureMetaName('twitter:image').setAttribute('content', prev.twImage);
  };
};
