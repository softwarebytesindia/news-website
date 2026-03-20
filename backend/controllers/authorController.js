const Author = require('../model/author');
const News = require('../model/news');

const buildAuthorPayload = async (input = {}, existingAuthor = null) => {
  const name = typeof input.name === 'string' ? input.name.trim() : existingAuthor?.name;
  const bio = typeof input.bio === 'string' ? input.bio.trim() : (existingAuthor?.bio || '');
  const avatar = typeof input.avatar === 'string' ? input.avatar.trim() : (existingAuthor?.avatar || '');

  return {
    name,
    bio,
    avatar
  };
};

const createAuthor = async (req, res) => {
  try {
    const author = new Author(await buildAuthorPayload(req.body));
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const existingAuthor = await Author.findById(req.params.id);
    if (!existingAuthor) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const payload = await buildAuthorPayload(req.body, existingAuthor);
    const author = await Author.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    res.json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const linkedNews = await News.exists({ author: req.params.id });
    if (linkedNews) {
      return res.status(400).json({ error: 'Author is linked with news articles and cannot be deleted' });
    }

    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor
};
