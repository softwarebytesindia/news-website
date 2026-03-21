const express = require('express');
const router = express.Router();
const { createNews, getAllNews, getNewsById, getNewsBySlug, updateNews, deleteNews, toggleBreakingNews } = require('../controllers/newsController');

router.post('/', createNews);
router.get('/', getAllNews);
router.get('/slug/:slug', getNewsBySlug);
router.patch('/:id/breaking', toggleBreakingNews);
router.get('/:id', getNewsById);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
