const express = require('express');
const router = express.Router();
const { createNews, getAllNews, getNewsById, updateNews, deleteNews } = require('../controllers/newsController');

router.post('/', createNews);
router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
