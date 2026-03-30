const NewsCategory = require('../model/newsCategory');

const normalizeName = (value = '') => String(value).trim().toLowerCase();

const createCategory = async (req, res) => {
  try {
    const { name, description, priority, seo } = req.body;
    const normalizedName = normalizeName(name);
    let slug = normalizedName.replace(/[\s_]+/g, '-');
    slug = slug.replace(/[^a-z0-9\-\u0900-\u097F]+/g, '').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
    if (!slug || /^[\d\-]+$/.test(slug)) slug = slug ? `cat-${slug}` : `cat-${Date.now()}`;
    
    const normalizedPriority = Number.isFinite(Number(priority)) ? Math.max(0, Number(priority)) : 0;
    const seoInput = seo && typeof seo === 'object' ? seo : {};
    
    const category = new NewsCategory({
      name: normalizedName,
      slug,
      description,
      priority: normalizedPriority,
      seo: {
        metaTitle: typeof seoInput.metaTitle === 'string' ? seoInput.metaTitle.trim() : '',
        metaDescription: typeof seoInput.metaDescription === 'string' ? seoInput.metaDescription.trim() : ''
      }
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await NewsCategory.find().sort({ priority: -1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await NewsCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, priority, isActive, seo } = req.body;
    const normalizedName = normalizeName(name);
    let slug = normalizedName.replace(/[\s_]+/g, '-');
    slug = slug.replace(/[^a-z0-9\-\u0900-\u097F]+/g, '').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
    if (!slug || /^[\d\-]+$/.test(slug)) slug = slug ? `cat-${slug}` : `cat-${Date.now()}`;
    
    const normalizedPriority = Number.isFinite(Number(priority)) ? Math.max(0, Number(priority)) : 0;
    const seoInput = seo && typeof seo === 'object' ? seo : {};
    
    const category = await NewsCategory.findByIdAndUpdate(
      req.params.id, 
      {
        name: normalizedName,
        slug,
        description,
        priority: normalizedPriority,
        isActive,
        seo: {
          metaTitle: typeof seoInput.metaTitle === 'string' ? seoInput.metaTitle.trim() : '',
          metaDescription: typeof seoInput.metaDescription === 'string' ? seoInput.metaDescription.trim() : ''
        }
      }, 
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await NewsCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
