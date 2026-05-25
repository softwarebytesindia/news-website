const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || (file.mimetype === 'application/pdf');

  if (extname && (mimetype || file.mimetype === 'application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.avif`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true
      })
      .avif({
        quality: 55,
        effort: 6
      })
      .toFile(outputPath);

    res.status(200).json({
      message: 'File uploaded and optimized successfully',
      filePath: `/uploads/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const originalName = path.parse(req.file.originalname).name.replace(/\s+/g, '-').toLowerCase();
    const filename = `${Date.now()}-${originalName}.pdf`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(outputPath, req.file.buffer);

    res.status(200).json({
      message: 'PDF uploaded successfully',
      filePath: `/uploads/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, uploadImage, uploadPdf };
