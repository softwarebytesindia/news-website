const mongoose = require('mongoose');
const News = require('../model/news');
const NewsCategory = require('../model/newsCategory');
const Author = require('../model/author');

const POPULATE_OPTIONS = [
  { path: 'category' },
  { path: 'author', select: 'name avatar' }
];

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

const toValidDate = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return date;
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

const estimateReadTime = (content = '') => {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const resolveAuthor = async (authorValue, existingNews = null) => {
  const currentAuthor = existingNews?.author || null;

  if (authorValue === null) {
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

const buildNewsPayload = async (input = {}, existingNews = null) => {
  const title = typeof input.title === 'string' ? input.title.trim() : existingNews?.title;
  const description = typeof input.description === 'string' ? input.description.trim() : existingNews?.description;
  const content = typeof input.content === 'string' ? input.content.trim() : existingNews?.content;

  if (!title || !description || !content) {
    throw new Error('Title, description, and content are required');
  }

  const category = input.category || existingNews?.category;
  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    throw new Error('Valid category is required');
  }

  const categoryExists = await NewsCategory.exists({ _id: category });
  if (!categoryExists) {
    throw new Error('Category not found');
  }

  const image = typeof input.image === 'string' ? input.image.trim() : (existingNews?.image || '');
  const featuredImageInput = input.featuredImage || {};
  const existingFeaturedImage = existingNews?.featuredImage || {};
  const featuredImageUrl = typeof featuredImageInput.url === 'string'
    ? featuredImageInput.url.trim()
    : (image || existingFeaturedImage.url || '');

  const excerpt = typeof input.excerpt === 'string' && input.excerpt.trim()
    ? input.excerpt.trim()
    : (description || existingNews?.excerpt || '');

  const rawStatus = typeof input.status === 'string' ? input.status : existingNews?.status;
  let publishedAt = input.publishedAt !== undefined
    ? toValidDate(input.publishedAt, 'publishedAt')
    : (existingNews?.publishedAt || null);

  let isPublished = typeof input.isPublished === 'boolean'
    ? input.isPublished
    : (existingNews?.isPublished ?? false);
  let status = ['draft', 'review', 'scheduled', 'published', 'archived'].includes(rawStatus)
    ? rawStatus
    : (isPublished ? 'published' : 'draft');

  if (status === 'published' || isPublished) {
    status = 'published';
    isPublished = true;
    publishedAt = publishedAt || new Date();
  } else if (status === 'archived' || status === 'review' || status === 'draft') {
    isPublished = false;
    publishedAt = null;
  }

  const author = await resolveAuthor(input.author, existingNews);

  const sourceInput = input.source || {};
  const existingSource = existingNews?.source || {};
  const seoInput = input.seo || {};
  const existingSeo = existingNews?.seo || {};

  const views = Number.isFinite(Number(input.views)) ? Number(input.views) : (existingNews?.views ?? 0);
  const priority = Number.isFinite(Number(input.priority)) ? Number(input.priority) : (existingNews?.priority ?? 0);

  return {
    title,
    slug: await getUniqueNewsSlug(input.slug || title, existingNews?._id),
    description,
    excerpt,
    content,
    image: image || featuredImageUrl,
    featuredImage: {
      url: featuredImageUrl,
      alt: typeof featuredImageInput.alt === 'string' ? featuredImageInput.alt.trim() : (existingFeaturedImage.alt || title),
      caption: typeof featuredImageInput.caption === 'string' ? featuredImageInput.caption.trim() : (existingFeaturedImage.caption || ''),
      credit: typeof featuredImageInput.credit === 'string' ? featuredImageInput.credit.trim() : (existingFeaturedImage.credit || '')
    },
    category,
    tags: input.tags !== undefined ? normalizeTags(input.tags) : (existingNews?.tags || []),
    author,
    status,
    isFeatured: typeof input.isFeatured === 'boolean' ? input.isFeatured : (existingNews?.isFeatured ?? false),
    isPublished,
    isBreaking: typeof input.isBreaking === 'boolean' ? input.isBreaking : (existingNews?.isBreaking ?? false),
    publishedAt,
    source: {
      name: typeof sourceInput.name === 'string' ? sourceInput.name.trim() : (existingSource.name || ''),
      url: typeof sourceInput.url === 'string' ? sourceInput.url.trim() : (existingSource.url || ''),
      type: typeof sourceInput.type === 'string' ? sourceInput.type.trim() : (existingSource.type || '')
    },
    seo: {
      metaTitle: typeof seoInput.metaTitle === 'string' ? seoInput.metaTitle.trim() : (existingSeo.metaTitle || title),
      metaDescription: typeof seoInput.metaDescription === 'string' ? seoInput.metaDescription.trim() : (existingSeo.metaDescription || excerpt),
      keywords: seoInput.keywords !== undefined ? normalizeTags(seoInput.keywords) : (existingSeo.keywords || [])
    },
    location: typeof input.location === 'string' ? input.location.trim() : (existingNews?.location || ''),
    language: typeof input.language === 'string' && input.language.trim() ? input.language.trim().toLowerCase() : (existingNews?.language || 'en'),
    readTime: Number.isFinite(Number(input.readTime)) && Number(input.readTime) > 0
      ? Number(input.readTime)
      : estimateReadTime(content),
    views: Math.max(0, views),
    priority: Math.max(0, priority),
    allowComments: typeof input.allowComments === 'boolean' ? input.allowComments : (existingNews?.allowComments ?? true)
  };
};

const createNews = async (req, res) => {
  try {
    const payload = await buildNewsPayload(req.body);
    const news = new News(payload);
    await news.save();
    await news.populate(POPULATE_OPTIONS);
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate(POPULATE_OPTIONS)
      .sort({ priority: -1, publishedAt: -1, createdAt: -1 });
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

module.exports = { createNews, getAllNews, getNewsById, updateNews, deleteNews };
