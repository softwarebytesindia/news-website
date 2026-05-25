const express = require('express');
const router = express.Router();
const {
  createEpaper,
  getAllEpapers,
  getEpaperById,
  updateEpaper,
  deleteEpaper,
  getArchives
} = require('../controllers/epaperController');

router.post('/', createEpaper);
router.get('/', getAllEpapers);
router.get('/archives', getArchives);
router.get('/:id', getEpaperById);
router.put('/:id', updateEpaper);
router.delete('/:id', deleteEpaper);

module.exports = router;
