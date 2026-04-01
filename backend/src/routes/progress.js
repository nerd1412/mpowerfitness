const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyProgress, logProgress, deleteProgress, getStats } = require('../controllers/progressController');

const router = express.Router();
router.use(protect);

router.get('/my', getMyProgress);
router.post('/', authorize('user'), logProgress);
router.delete('/:id', authorize('user'), deleteProgress);
router.get('/stats/summary', getStats);

module.exports = router;
