// node seedOne.js
import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';
import Category from './models/Category.js';

await mongoose.connect(process.env.MONGO_URI);
let cat = await Category.findOne({ name: 'Rings' });
if (!cat) cat = await Category.create({ name: 'Rings', description: 'Premium Rings Collection', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800' });

const exists = await Product.findOne({ name: /Royal Gold Plated Zircon Ring/i });
if (!exists) {
  await Product.create({
    name: 'Royal Gold Plated Zircon Ring - TALHA Premium',
    price: 2499, salePrice: 1799, stock: 25,
    category: cat._id, material: 'Gold',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800' }],
    sizes: ['6','7','8','9','10'],
    shortDescription: 'Premium gold plated zircon ring - shine jo sabko attract kare',
    description: 'TALHA ka best seller ring. High quality gold plating, original zircon stone, skin-friendly, daily wear ke liye perfect.',
    isFeatured: true, isBestSeller: true, isNewArrival: true, isTrending: true, isPublished: true,
    rating: 5, numReviews: 0,
  });
  console.log('✅ 1 Product Added!');
} else console.log('Already exists');
process.exit(0);