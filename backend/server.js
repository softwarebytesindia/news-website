require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/newsdb';
const SITE_URL = (process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://newsdigitalbharat.com').replace(/\/+$/, '');

app.set('trust proxy', true);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://newsdigitalbharat.com',
  'https://www.newsdigitalbharat.com',
  'https://newbharatdigital.com',
  'https://www.newbharatdigital.com',
  'https://adm.newbharatdigital.com'
];

// ── Security & SEO HTTP Headers ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());
app.use(cookieParser());

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ── Bot Prerender Middleware ──────────────────────────────────────────────────
// Injects populated meta tags into the HTML shell for search crawlers and
// social share bots (WhatsApp, Facebook, Twitter, Googlebot) that don't
// execute JavaScript. This is the critical fix for a React SPA news site.
const News = require('./model/news');
const NewsCategory = require('./model/newsCategory');
const SubCategory = require('./model/subCategory');

const BOT_UA_REGEX = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|applebot|rogerbot|embedly|quora|pinterest|slackbot|vkshare|facebot|telegrambot|discordbot|redditbot|ahrefsbot|semrushbot/i;

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const getPublicOrigin = (req) => {
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost ? forwardedHost.split(',')[0].trim() : req.get('host');

  if (!host || /localhost|127\.0\.0\.1/i.test(host)) {
    return SITE_URL;
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  return `${protocol || 'https'}://${host}`.replace(/\/+$/, '');
};

const resolvePublicUrl = (value = '', origin = SITE_URL) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${origin}${normalizedPath}`;
};

const getImageMimeType = (url = '') => {
  const pathname = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return String(url);
    }
  })().toLowerCase();

  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.avif')) return 'image/avif';
  return 'image/webp';
};

const resolveFrontendHtml = () => {
  try {
    const fs = require('fs');
    const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    if (fs.existsSync(frontendDistPath)) {
      return fs.readFileSync(frontendDistPath, 'utf8');
    }
  } catch { /* ignore */ }
  return null;
};

app.use(async (req, res, next) => {
  const ua = req.get('User-Agent') || '';

  // Only prerender for bots, skip API/static/admin routes
  if (!BOT_UA_REGEX.test(ua)) return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/admin')) return next();
  if (req.path.endsWith('.xml') || req.path.endsWith('.txt') || req.path.endsWith('.json')) return next();

  const baseHtml = resolveFrontendHtml();
  if (!baseHtml) return next(); // No built frontend — skip

  try {
    const segments = req.path.split('/').filter(Boolean).map(s => decodeURIComponent(s));
    let title = 'New Bharat Digital — ताजा हिंदी समाचार';
    let description = 'ताजा खबरें, ब्रेकिंग न्यूज़ और सभी प्रमुख श्रेणियों की हिंदी समाचार अपडेट पढ़ें।';
    const publicOrigin = getPublicOrigin(req);
    let image = resolvePublicUrl('/news.webp', publicOrigin);
    let type = 'website';
    let canonical = resolvePublicUrl(req.path, publicOrigin);
    let publishedTime = '';
    let modifiedTime = '';
    let articleAuthor = '';
    let articleSection = '';
    let articleTags = '';

    // Article page: /category/slug OR /category/sub/slug
    if (segments.length === 2 || segments.length === 3) {
      const slug = segments[segments.length - 1].toLowerCase();
      const article = await News.findOne({ slug, status: 'published' })
        .populate([{ path: 'category' }, { path: 'subCategory', select: 'name slug' }, { path: 'author', select: 'name' }])
        .select('title hindiTitle excerpt hindiExcerpt content hindiContent seo featuredImage category subCategory author createdAt updatedAt tags');

      if (article) {
        title = article.seo?.metaTitle || article.hindiTitle || article.title || title;
        
        // Build description: SEO Meta > Hindi Excerpt > English Excerpt > Truncated Content
        const plainHindi = stripHtml(article.hindiContent || '');
        const plainEng = stripHtml(article.content || '');
        const fallbackDesc = plainHindi.length > 50 ? plainHindi : plainEng;
        
        description = article.seo?.metaDescription || 
                      article.hindiExcerpt || 
                      article.excerpt || 
                      (fallbackDesc.length > 180 ? fallbackDesc.slice(0, 180) + '...' : fallbackDesc) || 
                      description;

        image = resolvePublicUrl(article.featuredImage?.url || '/news.webp', publicOrigin);
        type = 'article';
        publishedTime = article.createdAt ? new Date(article.createdAt).toISOString() : '';
        modifiedTime = article.updatedAt ? new Date(article.updatedAt).toISOString() : '';
        articleAuthor = article.author?.name || 'New Bharat Digital';
        articleSection = article.category?.name || '';
        articleTags = Array.isArray(article.tags) ? article.tags.join(',') : '';
      }
    }

    // Category page: /category-slug
    if (segments.length === 1) {
      const cat = await NewsCategory.findOne({ slug: segments[0], isActive: true }).select('name seo description');
      if (cat) {
        title = cat.seo?.metaTitle || `${cat.name} समाचार | New Bharat Digital`;
        description = cat.seo?.metaDescription || cat.description || `${cat.name} की ताजा खबरें पढ़ें New Bharat Digital पर।`;
      }
    }

    const articleMeta = type === 'article' ? `
  <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />
  <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />
  <meta property="article:author" content="${escapeHtml(articleAuthor)}" />
  <meta property="article:section" content="${escapeHtml(articleSection)}" />
  <meta property="article:tag" content="${escapeHtml(articleTags)}" />` : '';

    const injectedMeta = `
  <!-- SEO Prerender Inject -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
  <meta property="og:image:type" content="${escapeHtml(getImageMimeType(image))}" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="New Bharat Digital" />
  <meta property="og:locale" content="hi_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />${articleMeta}`;

    // Inject into <head> — strip generic duplicate SEO tags to prioritize dynamic tags
    // Use [\s\S]*? to handle multiline tags in index.html
    let html = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta[^>]*?name="description"[\s\S]*?>/gi, '')
      .replace(/<meta[^>]*?property="og:[^"]+"[\s\S]*?>/gi, '')
      .replace(/<meta[^>]*?name="twitter:[^"]+"[\s\S]*?>/gi, '')
      .replace('</head>', `${injectedMeta}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min for bots
    res.send(html);
  } catch (err) {
    console.error('Prerender error:', err.message);
    next(); // Fall through to normal serving
  }
});

// ── Sitemap Routes (served before static files) ───────────────────────────────
app.use('/', sitemapRoutes);

// ── API Routes ────────────────────────────────────────────────────────────────
app.get('/api', (req, res) => res.send('News API is running'));
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d', // Cache uploads for 30 days
  immutable: true
}));

// ── Admin Panel ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ── Frontend Static Hosting (Crucial for Bot SEO Prerendering) ───────────
const frontendStaticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendStaticPath, { index: false }));

// Fallback all other routes to frontend's index.html to support React Router
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/admin')) {
    return next();
  }
  const indexPath = path.join(frontendStaticPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) next();
  });
});

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
