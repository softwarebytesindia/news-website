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
    featuredImage: {
      url: { type: String, trim: true, default: '' },
      alt: { type: String, trim: true, default: '' }
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
    isBreaking: {
      type: Boolean,
      default: false,
      index: true
    },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
      keywords: [{ type: String, trim: true, lowercase: true }]
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
    }
  },
  {
    timestamps: true
  }
);

newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ category: 1, status: 1, createdAt: -1 });
newsSchema.index({ tags: 1 });

module.exports = mongoose.model('News', newsSchema);
