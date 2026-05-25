const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 50
    },
    featuredImage: {
      url: { type: String, trim: true, default: '' },
      jpgUrl: { type: String, trim: true, default: '' },
      alt: { type: String, trim: true, default: '' }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsCategory',
      required: true,
      index: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      default: null,
      index: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true
    },
    isBreaking: {
      type: Boolean,
      default: false,
      index: true
    },
    breakingAt: {
      type: Date,
      default: null,
      index: true
    },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' }
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: Number,
      default: 0,
      min: 0
    },
    hindiTitle: {
      type: String,
      trim: true,
      default: ''
    },
    hindiExcerpt: {
      type: String,
      trim: true,
      default: ''
    },
    hindiContent: {
      type: String,
      trim: true,
      default: ''
    },
    hindiFont: {
      type: String,
      trim: true,
      default: 'Hind'
    }
  },
  {
    timestamps: true
  }
);

newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ category: 1, status: 1, createdAt: -1 });
newsSchema.index({ tags: 1 });

// Full-text search index for /api/search
newsSchema.index(
  { title: 'text', hindiTitle: 'text', excerpt: 'text', tags: 'text' },
  { weights: { title: 10, hindiTitle: 10, tags: 5, excerpt: 3 }, name: 'news_text_search' }
);

module.exports = mongoose.model('News', newsSchema);
