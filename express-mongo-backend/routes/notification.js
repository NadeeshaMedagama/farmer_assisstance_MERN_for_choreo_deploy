const router = require('express').Router();
const { protect } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.use(protect);
router.get('/', notificationController.list);
router.post('/', notificationController.create);
router.post('/:id/read', notificationController.markRead);

module.exports = router;
