const router = require('express').Router();
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.get('/me', protect, authController.me);
router.put('/me', protect, authController.updateProfile);

module.exports = router;
