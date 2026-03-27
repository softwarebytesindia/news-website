require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/newsdb';

app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('News API is running');
});

app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

