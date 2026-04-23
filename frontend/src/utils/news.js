export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const PUBLIC_SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://newsdigitalbharat.com')).replace(/\/+$/, '');
export const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_BASE_URL || API_BASE_URL).replace(/\/+$/, '');

export const NEWS_API_URL = `${API_BASE_URL}/api/news`;
export const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories`;
export const SEARCH_API_URL = `${API_BASE_URL}/api/search`;
export const SITE_NAME = 'New Bharat Digital';
export const SITE_URL = PUBLIC_SITE_URL;
export const TWITTER_HANDLE = '@NewBharatDigital'; // Update to your actual handle

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${MEDIA_BASE_URL}${url}` : `${MEDIA_BASE_URL}/${url}`;
};

const deriveSocialJpgPath = (url = '') => {
  const raw = String(url || '').trim();
  const match = raw.match(/^(.*\/uploads\/)([^/?#/.]+)\.[^/?#]+([?#].*)?$/i);
  if (!match) return '';
  return `${match[1]}social/${match[2]}.jpg`;
};

export const getFeaturedImageUrl = (article) => (
  article?.featuredImage?.url
    ? resolveMediaUrl(article.featuredImage.url)
    : resolveMediaUrl(article?.featuredImage?.jpgUrl || '')
);

export const getFeaturedImageJpgUrl = (article) => {
  if (article?.featuredImage?.jpgUrl) {
    return resolveMediaUrl(article.featuredImage.jpgUrl);
  }

  const derivedPath = deriveSocialJpgPath(article?.featuredImage?.url || '');
  return derivedPath ? resolveMediaUrl(derivedPath) : '';
};

export const useFeaturedImageFallback = (event, article) => {
  const fallbackUrl = getFeaturedImageJpgUrl(article);
  if (!fallbackUrl || event.currentTarget.src === fallbackUrl) {
    return;
  }

  event.currentTarget.src = fallbackUrl;
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

/** Removes an OG/article meta property tag entirely (used during cleanup) */
const removeMeta = (selector) => {
  const el = document.head.querySelector(selector);
  if (el) el.remove();
};

/**
 * Securely converts plain text URLs within an HTML string into clickable <a> tags.
 */
export const linkifyHtml = (html) => {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const urlRegex = /(https?:\/\/[^\s<]+)/g;

  const traverse = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button' || tag === 'script' || tag === 'style') {
        return;
      }
      Array.from(node.childNodes).forEach(traverse);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (urlRegex.test(text)) {
        urlRegex.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }

          const a = document.createElement('a');
          const url = match[0];
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
 * Strip query params and hash from a URL — canonical URLs must be clean.
 */
const toCanonicalUrl = (url = '') => {
  try {
    const u = new URL(url || window.location.href);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
};

/**
 * applySeoMeta — sets all important SEO meta tags and returns a cleanup fn.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.image]            absolute image URL for OG/Twitter
 * @param {number} [opts.imageWidth]       OG image width (default 1200)
 * @param {number} [opts.imageHeight]      OG image height (default 630)
 * @param {string} [opts.url]              canonical URL (defaults to current href, query stripped)
 * @param {'website'|'article'} [opts.type]
 * @param {string} [opts.locale]           e.g. 'hi_IN'
 * @param {string} [opts.publishedTime]    ISO string — article:published_time
 * @param {string} [opts.modifiedTime]     ISO string — article:modified_time
 * @param {string} [opts.author]           author name — article:author
 * @param {string} [opts.section]          category name — article:section
 * @param {string[]} [opts.tags]           tag list — article:tag
 * @param {string} [opts.robots]           e.g. 'noindex, follow' (defaults to 'index, follow')
 */
export const applySeoMeta = ({
  title = '',
  description = '',
  image = '',
  imageWidth = 1200,
  imageHeight = 630,
  url = '',
  type = 'website',
  locale = 'hi_IN',
  publishedTime = '',
  modifiedTime = '',
  author = '',
  section = '',
  tags = [],
  robots = 'index, follow'
} = {}) => {
  if (typeof document === 'undefined') return () => {};

  const canonical = toCanonicalUrl(url || window.location.href);
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
    twSite: ensureMetaName('twitter:site').getAttribute('content') || '',
    robots: ensureMetaName('robots').getAttribute('content') || 'index, follow',
    hadArticleMeta: !!document.head.querySelector('meta[property="article:published_time"]'),
  };

  // ── Apply core tags ──────────────────────────────────────────────────────
  document.title = fullTitle;
  ensureMetaName('description').setAttribute('content', description);
  ensureMetaName('robots').setAttribute('content', robots);
  ensureLink('canonical', 'seo').setAttribute('href', canonical);

  // Open Graph
  ensureMetaProp('og:title').setAttribute('content', fullTitle);
  ensureMetaProp('og:description').setAttribute('content', description);
  ensureMetaProp('og:image').setAttribute('content', image);
  ensureMetaProp('og:image:width').setAttribute('content', String(imageWidth));
  ensureMetaProp('og:image:height').setAttribute('content', String(imageHeight));
  ensureMetaProp('og:url').setAttribute('content', canonical);
  ensureMetaProp('og:type').setAttribute('content', type);
  ensureMetaProp('og:locale').setAttribute('content', locale);
  ensureMetaProp('og:site_name').setAttribute('content', SITE_NAME);

  // Twitter Card
  ensureMetaName('twitter:card').setAttribute('content', image ? 'summary_large_image' : 'summary');
  ensureMetaName('twitter:title').setAttribute('content', fullTitle);
  ensureMetaName('twitter:description').setAttribute('content', description);
  ensureMetaName('twitter:image').setAttribute('content', image);
  ensureMetaName('twitter:site').setAttribute('content', TWITTER_HANDLE);

  // ── Article-specific OG tags ─────────────────────────────────────────────
  const articleTagEls = [];
  if (type === 'article') {
    if (publishedTime) {
      ensureMetaProp('article:published_time').setAttribute('content', publishedTime);
      articleTagEls.push('article:published_time');
    }
    if (modifiedTime) {
      ensureMetaProp('article:modified_time').setAttribute('content', modifiedTime);
      articleTagEls.push('article:modified_time');
    }
    if (author) {
      ensureMetaProp('article:author').setAttribute('content', author);
      articleTagEls.push('article:author');
    }
    if (section) {
      ensureMetaProp('article:section').setAttribute('content', section);
      articleTagEls.push('article:section');
    }
    // article:tag — one per tag
    tags.forEach((tag) => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'article:tag');
      el.setAttribute('content', tag);
      el.setAttribute('data-article-tag', 'true');
      document.head.appendChild(el);
      articleTagEls.push(el);
    });
  }

  // Cleanup fn — restore previous values and remove article-specific metas
  return () => {
    document.title = prev.title;
    ensureMetaName('description').setAttribute('content', prev.description);
    ensureMetaName('robots').setAttribute('content', prev.robots);
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
    ensureMetaName('twitter:site').setAttribute('content', prev.twSite);

    // Remove article-specific metas
    if (!prev.hadArticleMeta) {
      ['article:published_time', 'article:modified_time', 'article:author', 'article:section'].forEach(prop => {
        removeMeta(`meta[property="${prop}"]`);
      });
    }
    document.head.querySelectorAll('meta[data-article-tag="true"]').forEach(el => el.remove());
  };
};
