const mongoose = require('mongoose');

const featuredImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
    credit: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
    type: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    keywords: [{ type: String, trim: true, lowercase: true }]
  },
  { _id: false }
);

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
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 400
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
    image: {
      type: String,
      trim: true,
      default: ''
    },
    featuredImage: {
      type: featuredImageSchema,
      default: () => ({})
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsCategory',
      required: true,
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
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    isBreaking: {
      type: Boolean,
      default: false,
      index: true
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true
    },
    source: {
      type: sourceSchema,
      default: () => ({})
    },
    seo: {
      type: seoSchema,
      default: () => ({})
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    language: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'en'
    },
    readTime: {
      type: Number,
      default: 1,
      min: 1
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    priority: {
      type: Number,
      default: 0,
      min: 0
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ category: 1, status: 1, publishedAt: -1 });
newsSchema.index({ tags: 1 });

module.exports = mongoose.model('News', newsSchema);
