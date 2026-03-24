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

const News = require('./model/news');
const NewsCategory = require('./model/newsCategory');
const SubCategory = require('./model/subCategory');

const app = express();
const PORT = process.env.PORT || 5000;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/newsdb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('News API is running');
});

app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

/* ── Dynamic Sitemap ── */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [articles, categories, subCategories] = await Promise.all([
      News.find({ status: 'published' })
        .populate([{ path: 'category' }, { path: 'subCategory' }])
        .select('slug category subCategory updatedAt createdAt')
        .sort({ createdAt: -1 }),
      NewsCategory.find({ isActive: true }).select('slug updatedAt'),
      SubCategory.find({ isActive: true }).populate('category').select('slug category updatedAt')
    ]);

    const escape = (str = '') => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const toW3CDate = (date) => new Date(date || Date.now()).toISOString().split('T')[0];

    const urlEntry = (loc, lastmod, changefreq = 'weekly', priority = '0.5') =>
      `  <url>\n    <loc>${escape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

    const urls = [];

    // Homepage
    urls.push(urlEntry(`${SITE_URL}/`, toW3CDate(), 'daily', '1.0'));

    // Category pages
    for (const cat of categories) {
      urls.push(urlEntry(`${SITE_URL}/${cat.slug}`, toW3CDate(cat.updatedAt), 'daily', '0.8'));
    }

    // Subcategory pages
    for (const sub of subCategories) {
      if (sub.category?.slug) {
        urls.push(urlEntry(`${SITE_URL}/${sub.category.slug}/${sub.slug}`, toW3CDate(sub.updatedAt), 'weekly', '0.7'));
      }
    }

    // Article pages
    for (const article of articles) {
      const catSlug = article.category?.slug;
      const subSlug = article.subCategory?.slug;
      if (!catSlug || !article.slug) continue;
      const loc = subSlug
        ? `${SITE_URL}/${catSlug}/${subSlug}/${article.slug}`
        : `${SITE_URL}/${catSlug}/${article.slug}`;
      urls.push(urlEntry(loc, toW3CDate(article.updatedAt || article.createdAt), 'weekly', '0.6'));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Failed to generate sitemap');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

