const mongoose = require('mongoose');
const NewsCategory = require('../model/newsCategory');
const SubCategory = require('../model/subCategory');

const slugify = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/['"]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

const normalizeName = (value = '') => String(value).trim().toLowerCase();

const validateCategory = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error('Valid category is required');
  }

  const category = await NewsCategory.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

const createSubCategory = async (req, res) => {
  try {
    const { category, name, description, isActive } = req.body;
    if (!name || !String(name).trim()) {
      throw new Error('Subcategory name is required');
    }

    await validateCategory(category);

    const payload = {
      category,
      name: normalizeName(name),
      slug: slugify(name),
      description: typeof description === 'string' ? description.trim() : '',
      isActive: typeof isActive === 'boolean' ? isActive : true
    };

    const subCategory = new SubCategory(payload);
    await subCategory.save();
    await subCategory.populate({ path: 'category', select: 'name slug isActive' });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllSubCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      filter.category = req.query.category;
    }

    const subCategories = await SubCategory.find(filter)
      .populate({ path: 'category', select: 'name slug isActive' })
      .sort({ createdAt: -1 });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate({ path: 'category', select: 'name slug isActive' });
    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { category, name, description, isActive } = req.body;
    if (!name || !String(name).trim()) {
      throw new Error('Subcategory name is required');
    }

    await validateCategory(category);

    const payload = {
      category,
      name: normalizeName(name),
      slug: slugify(name),
      description: typeof description === 'string' ? description.trim() : '',
      isActive: typeof isActive === 'boolean' ? isActive : true
    };

    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate({ path: 'category', select: 'name slug isActive' });

    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
};
