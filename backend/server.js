require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const searchRoutes = require('./routes/searchRoutes');

const News = require('./model/news');

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

// ── Sitemap Routes ────────────────────────────────────────────────────────────
app.use('/', sitemapRoutes);

// ── Minimal Meta-Tag Injector for Social Bots (WhatsApp/Facebook) ────────────
const BOT_UA_REGEX = /facebookexternalhit|twitterbot|whatsapp|linkedinbot|applebot|discordbot|redditbot|slackbot|telegrambot/i;

app.use(async (req, res, next) => {
  const ua = req.get('User-Agent') || '';
  if (!BOT_UA_REGEX.test(ua) || req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/admin')) {
    return next();
  }

  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  if (!fs.existsSync(frontendDistPath)) return next();

  try {
    let html = fs.readFileSync(frontendDistPath, 'utf8');
    const segments = req.path.split('/').filter(Boolean).map(s => decodeURIComponent(s));

    // Simple logic: if it's a deep path, try to find an article
    if (segments.length >= 2) {
      const slug = segments[segments.length - 1].toLowerCase();
      const article = await News.findOne({ slug, status: 'published' }).select('title hindiTitle excerpt featuredImage');

      if (article) {
        const title = article.hindiTitle || article.title;
        const desc = article.excerpt || 'ताजा खबरें और ब्रेकिंग न्यूज़';
        const image = article.featuredImage?.jpgUrl 
          ? (article.featuredImage.jpgUrl.startsWith('http') ? article.featuredImage.jpgUrl : `${SITE_URL}${article.featuredImage.jpgUrl}`)
          : `${SITE_URL}/news.webp`;

        const metaTags = `
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${SITE_URL}${req.path}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />`;

        // Inject into head, replacing existing titles/og tags if any
        html = html.replace(/<title>.*?<\/title>/gi, '')
                   .replace(/<meta property="og:title".*?>/gi, '')
                   .replace(/<meta property="og:description".*?>/gi, '')
                   .replace(/<meta property="og:image".*?>/gi, '')
                   .replace('</head>', `${metaTags}\n</head>`);
      }
    }

    res.send(html);
  } catch (err) {
    next();
  }
});

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

// ── Frontend Static Hosting ───────────────────────────────────────────────────
const frontendStaticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendStaticPath, { index: false }));

// Fallback all other routes to frontend's index.html to support React Router
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/admin')) {
    return next();
  }
  const indexPath = path.join(frontendStaticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
