const Purchase = require('../models/Purchase');

class PurchaseService {
  async create(ownerUser, payload) {
    const doc = await Purchase.create({
      ...payload,
      username: payload.username || ownerUser.email || ownerUser.firstName,
      owner: ownerUser._id,
      userId: ownerUser._id.toString(),
    });
    return doc;
  }

  async list(ownerUser) {
    return Purchase.find({ owner: ownerUser._id }).sort({ dateOfPurchase: -1 });
  }

  async createFromOidc(oidcClaims, payload) {
    const username = payload.username || oidcClaims.preferred_username || oidcClaims.email || oidcClaims.sub;
    const userId = oidcClaims.sub;
    const doc = await Purchase.create({
      ...payload,
      username,
      userId
    });
    return doc;
  }

  async listForOidc(oidcClaims) {
    const userId = oidcClaims.sub;
    // Authorize strictly by OIDC subject (sub)
    return Purchase.find({ userId }).sort({ dateOfPurchase: -1 });
  }
}

module.exports = new PurchaseService();
