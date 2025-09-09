const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const purchaseController = require('../controllers/purchaseController');
const { districts, products } = require('../utils/constants');

router.use(protect);

router.post('/',
  body('dateOfPurchase').isISO8601().toDate(),
  body('deliveryTime').isIn(['10 AM', '11 AM', '12 PM']),
  body('deliveryDistrict').isIn(districts),
  body('productName').isIn(products),
  body('quantity').isInt({ min: 1 }),
  body('message').optional().isLength({ max: 500 }),
  validate,
  purchaseController.create
);

router.get('/', purchaseController.list);

module.exports = router;
