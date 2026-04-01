const express = require('express');
const { Op } = require('sequelize');
const { Blog } = require('../models/index');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const where = { isPublished: true };
    if (category) where.category = category;
    const { count, rows } = await Blog.findAndCountAll({
      where, order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      attributes: { exclude: ['content'] },
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, blogs: rows, total: count });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ where: { slug: req.params.slug, isPublished: true } });
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
    await blog.increment('views');
    res.json({ success: true, blog });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
