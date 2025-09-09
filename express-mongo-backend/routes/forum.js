const router = require('express').Router();
const { protect } = require('../middleware/auth');
const forumController = require('../controllers/forumController');

router.get('/', forumController.listThreads);
router.get('/:id', forumController.getThread);
router.post('/', protect, forumController.createThread);
router.post('/:id/replies', protect, forumController.reply);

module.exports = router;
