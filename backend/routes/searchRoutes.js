const express = require('express');
const router = express.Router();
const News = require('../model/news');

const POPULATE_OPTIONS = [
  { path: 'category' },
  { path: 'subCategory', select: 'name slug' },
  { path: 'author', select: 'name avatar' }
];

/**
 * GET /api/search?q=query&page=1&limit=12
 * Full-text search across news articles
 */
router.get('/', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    if (!query) {
      return res.json({ results: [], total: 0, page, totalPages: 0, query: '' });
    }

    // Build search filter — use $text if index exists, else regex fallback
    let filter;
    try {
      // Try text index first (fast, ranked)
      filter = {
        status: 'published',
        $text: { $search: query }
      };
      // Test if text index works with a count (fast)
      await News.countDocuments(filter);
    } catch {
      // Fallback to regex-based search
      const regex = new RegExp(query.split(' ').filter(Boolean).join('|'), 'i');
      filter = {
        status: 'published',
        $or: [
          { title: regex },
          { excerpt: regex },
          { tags: regex },
          { hindiTitle: regex }
        ]
      };
    }

    const [results, total] = await Promise.all([
      News.find(filter)
        .populate(POPULATE_OPTIONS)
        .sort(filter.$text ? { score: { $meta: 'textScore' } } : { priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      News.countDocuments(filter)
    ]);

    res.json({
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
