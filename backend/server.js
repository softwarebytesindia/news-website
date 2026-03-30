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
const SITE_URL = process.env.SITE_URL || 'https://newbharatdigital.com';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://newbharatdigital.com',
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
    let image = `${SITE_URL}/news.webp`;
    let type = 'website';
    let canonical = `${SITE_URL}${req.path}`;
    let publishedTime = '';
    let modifiedTime = '';
    let articleAuthor = '';
    let articleSection = '';
    let articleTags = '';

    // Article page: /category/slug OR /category/sub/slug
    if (segments.length === 2 || segments.length === 3) {
      const slug = segments[segments.length - 1];
      const article = await News.findOne({ slug, status: 'published' })
        .populate([{ path: 'category' }, { path: 'subCategory', select: 'name slug' }, { path: 'author', select: 'name' }])
        .select('title excerpt seo featuredImage category subCategory author createdAt updatedAt tags hindiTitle');

      if (article) {
        title = article.seo?.metaTitle || article.title || article.hindiTitle || title;
        const plainContent = stripHtml(article.content || '');
        description = article.seo?.metaDescription || article.excerpt || (plainContent.length > 160 ? plainContent.slice(0, 160) + '...' : plainContent) || description;
        image = article.featuredImage?.url
          ? (article.featuredImage.url.startsWith('http') ? article.featuredImage.url : `${SITE_URL}${article.featuredImage.url}`)
          : image;
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
    let html = baseHtml
      .replace(/<title>[^<]*<\/title>/gi, '')
      .replace(/<meta[^>]+name="description"[^>]*>/gi, '')
      .replace(/<meta[^>]+property="og:[a-z_]+"[^>]*>/gi, '')
      .replace(/<meta[^>]+name="twitter:[a-z_]+"[^>]*>/gi, '')
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
