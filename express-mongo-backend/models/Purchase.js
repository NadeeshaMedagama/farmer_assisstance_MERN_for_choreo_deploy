const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  userId: { type: String },
  dateOfPurchase: { type: Date, required: true },
  deliveryTime: { type: String, enum: ['10 AM', '11 AM', '12 PM'], required: true },
  deliveryDistrict: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, min: 1, required: true },
  message: { type: String, maxlength: 500 },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
}, { timestamps: true });

// Enforce date constraint (>= today, not Sunday)
PurchaseSchema.pre('validate', function(next) {
  if (!this.dateOfPurchase) return next();
  const date = new Date(this.dateOfPurchase);
  const today = new Date();
  today.setHours(0,0,0,0);
  if (date < today) return next(new Error('Date of purchase must be today or later'));
  if (date.getDay() === 0) return next(new Error('Purchases cannot be scheduled on Sunday'));
  next();
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
