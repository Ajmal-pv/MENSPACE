const mongoose = require('mongoose');
const { Schema } = mongoose;

const CouponSchema = new Schema({
  code: { type: String,
          required: true },
  discountType: { type: String,
                   enum: ['percentage', 'flat'],
                   required: true },
  discountAmount: { type: Number, 
                   required: true },
  maxDiscountAmount: { type: Number },
  minPurchase:{
    type:Number,
    required:true
  },
  expirationDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', CouponSchema);