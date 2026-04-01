const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { NutritionPlan } = require('../models/index');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const plans = await NutritionPlan.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
    const filtered = plans.filter(p => p.isPublic || (Array.isArray(p.assignedTo) && p.assignedTo.includes(req.user.id)));
    res.json({ success: true, plans: filtered });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authorize('trainer', 'admin', 'superadmin'), async (req, res) => {
  try {
    const plan = await NutritionPlan.create({ ...req.body, createdBy: req.user.id, creatorModel: req.userRole === 'trainer' ? 'Trainer' : 'Admin' });
    res.status(201).json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', authorize('trainer', 'admin', 'superadmin'), async (req, res) => {
  try {
    await NutritionPlan.update(req.body, { where: { id: req.params.id } });
    const plan = await NutritionPlan.findByPk(req.params.id);
    res.json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', authorize('trainer', 'admin', 'superadmin'), async (req, res) => {
  try {
    await NutritionPlan.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
