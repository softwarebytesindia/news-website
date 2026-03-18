const News = require('../model/news');

const createNews = async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const news = await News.find().populate('category').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('category');
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createNews, getAllNews, getNewsById, updateNews, deleteNews };
