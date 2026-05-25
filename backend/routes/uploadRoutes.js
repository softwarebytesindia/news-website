const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadPdf } = require('../controllers/uploadController');

router.post('/image', upload.single('image'), uploadImage);
router.post('/pdf', upload.single('pdf'), uploadPdf);

module.exports = router;
