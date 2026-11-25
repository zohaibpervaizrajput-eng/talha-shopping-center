import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true }, // Price at time of order - backend locked
  qty: { type: Number, required: true, min: 1 },
  size: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // TSC-1001
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String, phone: String, email: String,
    province: String, city: String, area: String,
    address: String, postalCode: String, instructions: String,
  },
  paymentMethod: { type: String, enum: ['COD','Bank Transfer','Easypaisa','JazzCash','Card'], required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCharges: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  status: { type: String, enum: ['Pending','Confirmed','Processing','Packed','Dispatched','Shipped','Out for Delivery','Delivered','Cancelled','Return Requested','Returned','Refunded'], default: 'Pending' },
  courier: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

export default mongoose.model('Order', orderSchema);