import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage','fixed','free_shipping'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });
export default mongoose.model('Coupon', couponSchema);