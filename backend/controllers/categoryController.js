const NewsCategory = require('../model/newsCategory');

const normalizeName = (value = '') => String(value).trim().toLowerCase();

const createCategory = async (req, res) => {
  try {
    const { name, description, priority } = req.body;
    const normalizedName = normalizeName(name);
    const slug = normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const normalizedPriority = Number.isFinite(Number(priority)) ? Math.max(0, Number(priority)) : 0;
    
    const category = new NewsCategory({ name: normalizedName, slug, description, priority: normalizedPriority });
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
    const { name, description, priority, isActive } = req.body;
    const normalizedName = normalizeName(name);
    const slug = normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const normalizedPriority = Number.isFinite(Number(priority)) ? Math.max(0, Number(priority)) : 0;
    
    const category = await NewsCategory.findByIdAndUpdate(
      req.params.id, 
      { name: normalizedName, slug, description, priority: normalizedPriority, isActive }, 
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
