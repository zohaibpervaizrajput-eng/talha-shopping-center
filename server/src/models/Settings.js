import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
  // Settings Schema me add karo:
locationAddress: { type: String, default: 'Main Bazaar, Sialkot, Punjab, Pakistan' },
locationCity: { type: String, default: 'Sialkot' },
storeTiming: { type: String, default: '9 AM - 10 PM (Mon - Sat)' },
mapEmbedUrl: { type: String, default: '' },
heroImages: { type: [String], default: [] },
heroImage: { type: String, default: '' },
heroTitle: { type: String, default: 'Timeless Jewellery' },
heroSubtitle: { type: String, default: 'Handcrafted with love, made to shine forever.' },
  key: { type: String, required: true, unique: true }, // 'site', 'shipping', 'payment'
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('Settings', settingsSchema);