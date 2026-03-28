const express = require('express');
const router = express.Router();
const News = require('../model/news');
const NewsCategory = require('../model/newsCategory');
const SubCategory = require('../model/subCategory');

const SITE_URL = process.env.SITE_URL || 'https://newbharatdigital.com';
const SITE_NAME = 'New Bharat Digital';
const SITE_LANGUAGE = 'hi';

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (date) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

/**
 * GET /sitemap.xml — Sitemap Index
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const xml = `${xmlHeader}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-news.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-articles.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * GET /sitemap-news.xml — Google News Sitemap (last 48 hours only)
 * Required for Google News indexing
 */
router.get('/sitemap-news.xml', async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const articles = await News.find({
      status: 'published',
      createdAt: { $gte: twoDaysAgo }
    })
      .populate([{ path: 'category' }, { path: 'subCategory', select: 'slug' }])
      .sort({ createdAt: -1 })
      .limit(1000)
      .select('title slug category subCategory createdAt updatedAt tags');

    const urls = articles.map((article) => {
      const categorySlug = article.category?.slug;
      const subCategorySlug = article.subCategory?.slug;
      const articlePath = subCategorySlug
        ? `/${categorySlug}/${subCategorySlug}/${article.slug}`
        : `/${categorySlug}/${article.slug}`;

      const keywords = Array.isArray(article.tags) && article.tags.length > 0
        ? `<news:keywords>${escapeXml(article.tags.join(', '))}</news:keywords>\n    `
        : '';

      return `  <url>
    <loc>${SITE_URL}${escapeXml(articlePath)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>${SITE_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${toIsoDate(article.createdAt)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      ${keywords}</news:news>
  </url>`;
    });

    const xml = `${xmlHeader}<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min (news is time-sensitive)
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating news sitemap');
  }
});

/**
 * GET /sitemap-articles.xml — All published articles (with image tags)
 */
router.get('/sitemap-articles.xml', async (req, res) => {
  try {
    const articles = await News.find({ status: 'published' })
      .populate([{ path: 'category' }, { path: 'subCategory', select: 'slug' }])
      .sort({ createdAt: -1 })
      .select('slug category subCategory createdAt updatedAt featuredImage title');

    const urls = articles.map((article) => {
      const categorySlug = article.category?.slug;
      const subCategorySlug = article.subCategory?.slug;
      if (!categorySlug) return '';

      const articlePath = subCategorySlug
        ? `/${categorySlug}/${subCategorySlug}/${article.slug}`
        : `/${categorySlug}/${article.slug}`;

      // Resolve featured image URL
      const rawImageUrl = article.featuredImage?.url || '';
      const imageUrl = rawImageUrl
        ? (rawImageUrl.startsWith('http') ? rawImageUrl : `${SITE_URL}${rawImageUrl}`)
        : '';

      const imageTag = imageUrl
        ? `\n    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`
        : '';

      return `  <url>
    <loc>${SITE_URL}${escapeXml(articlePath)}</loc>
    <lastmod>${toIsoDate(article.updatedAt || article.createdAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
    }).filter(Boolean);

    const xml = `${xmlHeader}<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating articles sitemap');
  }
});

/**
 * GET /sitemap-pages.xml — Static pages + category/subcategory pages
 */
router.get('/sitemap-pages.xml', async (req, res) => {
  try {
    const [categories, subCategories] = await Promise.all([
      NewsCategory.find({ isActive: true }).select('slug updatedAt'),
      SubCategory.find({ isActive: true }).populate({ path: 'category', select: 'slug' }).select('slug category updatedAt')
    ]);

    const staticPages = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/about', changefreq: 'monthly', priority: '0.6' },
      { path: '/contact', changefreq: 'monthly', priority: '0.6' },
      { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { path: '/terms', changefreq: 'yearly', priority: '0.3' },
      { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
    ];

    const staticUrls = staticPages.map(({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);

    const categoryUrls = categories.map((cat) => `  <url>
    <loc>${SITE_URL}/${escapeXml(cat.slug)}</loc>
    <lastmod>${toIsoDate(cat.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);

    const subCategoryUrls = subCategories
      .filter((sub) => sub.category?.slug)
      .map((sub) => `  <url>
    <loc>${SITE_URL}/${escapeXml(sub.category.slug)}/${escapeXml(sub.slug)}</loc>
    <lastmod>${toIsoDate(sub.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

    const xml = `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...categoryUrls, ...subCategoryUrls].join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating pages sitemap');
  }
});

module.exports = router;
