import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, default: '' },
  images: [{ url: String, alt: String, public_id: String }],
  videoUrl: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 }, // Original Price
  salePrice: { type: Number, default: 0 }, // Discounted Price, 0 = no discount
  stock: { type: Number, required: true, default: 0, min: 0 },
  sizes: [{ type: String }],
  material: { type: String, enum: ['Gold','Silver','Diamond','Artificial','Platinum',''], default: '' },
  purity: { type: String, default: '' }, // e.g. 22K, 925
  weight: { type: String, default: '' }, // e.g. 5.2g
  stoneType: { type: String, default: '' },
  stoneQuality: { type: String, default: '' },
  colour: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  brand: { type: String, default: 'TALHA' },
  warranty: { type: String, default: '' },
  careInstructions: { type: String, default: '' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
}, { timestamps: true });

productSchema.index({ slug: 1, sku: 1 });
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual: discount %
productSchema.virtual('discountPercent').get(function() {
  if (!this.price || !this.salePrice) return 0;
  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});
productSchema.virtual('isOnSale').get(function() {
  return this.salePrice < this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);