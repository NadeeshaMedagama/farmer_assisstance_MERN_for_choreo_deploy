const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

router.post('/register',
  body('firstName').isLength({ min: 1 }).withMessage('firstName is required'),
  body('lastName').isLength({ min: 1 }).withMessage('lastName is required'),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').isLength({ min: 6 }),
  validate,
  authController.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  authController.login
);

router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', body('email').isEmail(), validate, authController.forgotPassword);
router.post('/reset-password', body('password').isLength({ min: 6 }), validate, authController.resetPassword);

router.get('/me', protect, authController.me);
router.put('/me', protect, authController.updateProfile);

module.exports = router;
