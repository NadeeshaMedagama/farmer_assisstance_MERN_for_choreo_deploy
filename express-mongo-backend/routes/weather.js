const router = require('express').Router();
const weatherController = require('../controllers/weatherController');

router.get('/', weatherController.current);
router.get('/historical', weatherController.historical);
router.get('/stats', weatherController.stats);

module.exports = router;
