import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  province: { type: String, required: true, enum: ['Punjab','Sindh','Khyber Pakhtunkhwa','Balochistan','Islamabad Capital Territory','Gilgit-Baltistan','Azad Jammu and Kashmir'] },
  city: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['customer','admin','super_admin','product_manager','order_manager','inventory_manager','support','delivery_manager'], default: 'customer' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });



userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(entered){
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);