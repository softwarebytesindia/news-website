const Epaper = require('../model/epaper');
const mongoose = require('mongoose');

const createEpaper = async (req, res) => {
  try {
    const { title, date, pdfUrl, coverImage } = req.body;

    if (!date || !pdfUrl) {
      return res.status(400).json({ error: 'Date and PDF URL are required' });
    }

    // Check if epaper for this date already exists
    const existingEpaper = await Epaper.findOne({ date: new Date(date) });
    if (existingEpaper) {
      return res.status(400).json({ error: 'Epaper for this date already exists' });
    }

    const epaper = new Epaper({
      title,
      date: new Date(date),
      pdfUrl,
      coverImage
    });

    await epaper.save();
    res.status(201).json(epaper);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllEpapers = async (req, res) => {
  try {
    const { month, year, limit = 12, page = 1 } = req.query;
    const filter = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [epapers, total] = await Promise.all([
      Epaper.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Epaper.countDocuments(filter)
    ]);

    res.json({
      epapers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEpaperById = async (req, res) => {
  try {
    const epaper = await Epaper.findById(req.params.id);
    if (!epaper) {
      return res.status(404).json({ error: 'Epaper not found' });
    }
    res.json(epaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEpaper = async (req, res) => {
  try {
    const { title, date, pdfUrl, coverImage } = req.body;
    const epaper = await Epaper.findById(req.params.id);

    if (!epaper) {
      return res.status(404).json({ error: 'Epaper not found' });
    }

    if (date) {
      const dateObj = new Date(date);
      // Check if another epaper exists for this date
      const existingEpaper = await Epaper.findOne({ date: dateObj, _id: { $ne: req.params.id } });
      if (existingEpaper) {
        return res.status(400).json({ error: 'Epaper for this date already exists' });
      }
      epaper.date = dateObj;
    }

    if (title !== undefined) epaper.title = title;
    if (pdfUrl) epaper.pdfUrl = pdfUrl;
    if (coverImage !== undefined) epaper.coverImage = coverImage;

    await epaper.save();
    res.json(epaper);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEpaper = async (req, res) => {
  try {
    const epaper = await Epaper.findByIdAndDelete(req.params.id);
    if (!epaper) {
      return res.status(404).json({ error: 'Epaper not found' });
    }
    res.json({ message: 'Epaper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArchives = async (req, res) => {
  try {
    // Get distinct months and years that have epapers
    const archives = await Epaper.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ]);

    res.json(archives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEpaper,
  getAllEpapers,
  getEpaperById,
  updateEpaper,
  deleteEpaper,
  getArchives
};
