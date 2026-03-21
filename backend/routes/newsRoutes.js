const express = require('express');
const router = express.Router();
const { createNews, getAllNews, getNewsById, getNewsBySlug, getNewsByPath, updateNews, deleteNews, toggleBreakingNews } = require('../controllers/newsController');

router.post('/', createNews);
router.get('/', getAllNews);
router.get('/path/:categorySlug/:slug', getNewsByPath);
router.get('/path/:categorySlug/:subCategorySlug/:slug', getNewsByPath);
router.get('/slug/:slug', getNewsBySlug);
router.patch('/:id/breaking', toggleBreakingNews);
router.get('/:id', getNewsById);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
