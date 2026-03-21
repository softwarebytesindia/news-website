const mongoose = require('mongoose');
const News = require('../model/news');
const NewsCategory = require('../model/newsCategory');
const Author = require('../model/author');

const POPULATE_OPTIONS = [
  { path: 'category' },
  { path: 'author', select: 'name avatar' }
];
const VALID_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'];
const BREAKING_NEWS_LIMIT = 4;

const slugify = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/['"]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

const getUniqueNewsSlug = async (value, excludeId = null) => {
  const baseSlug = slugify(value) || `news-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (await News.exists({ slug, _id: { $ne: excludeId } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const normalizeTags = (tags) => {
  const rawTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];

  return [...new Set(
    rawTags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
  )];
};

const resolveAuthor = async (authorValue, existingNews = null) => {
  const currentAuthor = existingNews?.author || null;

  if (authorValue === null || authorValue === '') {
    return null;
  }

  if (authorValue && mongoose.Types.ObjectId.isValid(authorValue)) {
    const author = await Author.findById(authorValue);
    if (!author) {
      throw new Error('Author not found');
    }

    return author._id;
  }

  return currentAuthor;
};

const syncBreakingNewsLimit = async () => {
  const breakingNews = await News.find({ isBreaking: true })
    .sort({ breakingAt: -1, createdAt: -1, _id: -1 })
    .select('_id');

  if (breakingNews.length <= BREAKING_NEWS_LIMIT) {
    return;
  }

  const demotedIds = breakingNews.slice(BREAKING_NEWS_LIMIT).map((item) => item._id);
  await News.updateMany(
    { _id: { $in: demotedIds } },
    { $set: { isBreaking: false, breakingAt: null } }
  );
};

const buildNewsPayload = async (input = {}, existingNews = null) => {
  const title = typeof input.title === 'string' ? input.title.trim() : existingNews?.title;
  const content = typeof input.content === 'string' ? input.content.trim() : existingNews?.content;

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  const category = input.category || existingNews?.category;
  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    throw new Error('Valid category is required');
  }

  const categoryExists = await NewsCategory.exists({ _id: category });
  if (!categoryExists) {
    throw new Error('Category not found');
  }

  const imageFallback = typeof input.image === 'string' && input.image.trim()
    ? input.image.trim()
    : '';
  const featuredImageInput = input.featuredImage || {};
  const existingFeaturedImage = existingNews?.featuredImage || {};
  const featuredImageUrl = typeof featuredImageInput.url === 'string'
    ? featuredImageInput.url.trim()
    : imageFallback || existingFeaturedImage.url || '';

  const seoInput = input.seo || {};
  const existingSeo = existingNews?.seo || {};
  const requestedMetaDescription = typeof seoInput.metaDescription === 'string'
    ? seoInput.metaDescription.trim()
    : '';
  const excerpt = typeof input.excerpt === 'string' && input.excerpt.trim()
    ? input.excerpt.trim()
    : (existingNews?.excerpt || requestedMetaDescription || '');

  const rawStatus = typeof input.status === 'string' ? input.status : existingNews?.status;
  const status = VALID_STATUSES.includes(rawStatus)
    ? rawStatus
    : (existingNews?.status || 'draft');

  const author = await resolveAuthor(input.author, existingNews);
  const priority = Number.isFinite(Number(input.priority)) ? Number(input.priority) : (existingNews?.priority ?? 0);
  const isBreaking = typeof input.isBreaking === 'boolean' ? input.isBreaking : (existingNews?.isBreaking ?? false);
  const breakingAt = isBreaking
    ? (existingNews?.isBreaking ? (existingNews.breakingAt || new Date()) : new Date())
    : null;

  return {
    title,
    slug: await getUniqueNewsSlug(input.slug || title, existingNews?._id),
    excerpt,
    content,
    featuredImage: {
      url: featuredImageUrl,
      alt: typeof featuredImageInput.alt === 'string' ? featuredImageInput.alt.trim() : (existingFeaturedImage.alt || title)
    },
    category,
    tags: input.tags !== undefined ? normalizeTags(input.tags) : (existingNews?.tags || []),
    author,
    status,
    isBreaking,
    breakingAt,
    seo: {
      metaTitle: typeof seoInput.metaTitle === 'string' ? seoInput.metaTitle.trim() : (existingSeo.metaTitle || title),
      metaDescription: requestedMetaDescription || existingSeo.metaDescription || excerpt,
      keywords: seoInput.keywords !== undefined ? normalizeTags(seoInput.keywords) : (existingSeo.keywords || [])
    },
    location: typeof input.location === 'string' ? input.location.trim() : (existingNews?.location || ''),
    priority: Math.max(0, priority)
  };
};

const createNews = async (req, res) => {
  try {
    const payload = await buildNewsPayload(req.body);
    const news = new News(payload);
    await news.save();
    if (payload.isBreaking) {
      await syncBreakingNewsLimit();
    }
    await news.populate(POPULATE_OPTIONS);
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.status === 'string' && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.isBreaking === 'true') {
      filter.isBreaking = true;
    }
    if (req.query.isBreaking === 'false') {
      filter.isBreaking = false;
    }
    if (req.query.excludeBreaking === 'true') {
      filter.isBreaking = false;
    }

    const sort = req.query.sort === 'breaking'
      ? { breakingAt: -1, createdAt: -1 }
      : { priority: -1, createdAt: -1 };
    const limit = Number.parseInt(req.query.limit, 10);

    let query = News.find(filter)
      .populate(POPULATE_OPTIONS)
      .sort(sort);

    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const news = await query;
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate(POPULATE_OPTIONS);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    const payload = await buildNewsPayload(req.body, existingNews);
    const news = await News.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate(POPULATE_OPTIONS);
    if (payload.isBreaking) {
      await syncBreakingNewsLimit();
    }

    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const toggleBreakingNews = async (req, res) => {
  try {
    if (typeof req.body.isBreaking !== 'boolean') {
      return res.status(400).json({ error: 'isBreaking must be a boolean' });
    }

    const updates = {
      isBreaking: req.body.isBreaking,
      breakingAt: req.body.isBreaking ? new Date() : null
    };

    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    await News.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (req.body.isBreaking) {
      await syncBreakingNewsLimit();
    }

    const news = await News.findById(req.params.id).populate(POPULATE_OPTIONS);
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createNews, getAllNews, getNewsById, updateNews, deleteNews, toggleBreakingNews };
