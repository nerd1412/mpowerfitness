const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { Program } = require('../models/index');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const programs = await Program.findAll({ where: { isActive: true }, order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']] });
    res.json({ success: true, programs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, program });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const program = await Program.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, program });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    await Program.update(req.body, { where: { id: req.params.id } });
    const program = await Program.findByPk(req.params.id);
    res.json({ success: true, program });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    await Program.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
