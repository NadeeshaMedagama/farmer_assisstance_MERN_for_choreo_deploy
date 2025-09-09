const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const marketController = require('../controllers/marketController');

router.get('/', marketController.list);
router.get('/external', marketController.externalLookup);
router.post('/', protect, authorize('admin', 'expert', 'farmer'), marketController.upsert);

module.exports = router;
