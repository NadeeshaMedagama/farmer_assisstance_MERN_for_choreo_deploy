const router = require('express').Router();
const { oidcProtect } = require('../middleware/oidc');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const purchaseController = require('../controllers/purchaseController');
const purchaseService = require('../services/purchaseService');
const { districts, products } = require('../utils/constants');

router.get('/profile', oidcProtect, (req, res) => {
  const c = req.oidc.claims || {};
  res.json({
    success: true,
    data: {
      username: c.preferred_username || c.email || c.sub,
      name: c.name,
      email: c.email,
      phone: c.phone_number,
      country: c.country || c.locale,
      raw: c
    }
  });
});

// OIDC purchases: create and list, bound to token's subject
router.post('/purchases',
  oidcProtect,
  body('dateOfPurchase').isISO8601().toDate(),
  body('deliveryTime').isIn(['10 AM', '11 AM', '12 PM']),
  body('deliveryDistrict').isIn(districts),
  body('productName').isIn(products),
  body('quantity').isInt({ min: 1 }),
  body('message').optional().isLength({ max: 500 }),
  validate,
  async (req, res, next) => {
    try {
      const doc = await purchaseService.createFromOidc(req.oidc.claims, req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/purchases', oidcProtect, async (req, res, next) => {
  try {
    const data = await purchaseService.listForOidc(req.oidc.claims);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Provide allowed options for client validation
router.get('/options', (req, res) => {
  res.json({ success: true, data: { districts, products, deliveryTimes: ['10 AM', '11 AM', '12 PM'] } });
});

// Logout hint endpoint (client should redirect to IDP end-session endpoint)
router.get('/logout-url', (req, res) => {
  const issuer = (process.env.OIDC_ISSUER || '').replace(/\/$/, '');
  const postLogoutRedirectUri = process.env.OIDC_LOGOUT_REDIRECT || (process.env.CLIENT_URL || 'http://localhost:3000');
  const url = issuer
    ? `${issuer}/oauth2/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`
    : null;
  res.json({ success: true, data: { url } });
});

module.exports = router;
