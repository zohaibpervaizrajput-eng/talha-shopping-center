import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ✅ GET ALL - /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, limit = 100 } = req.query;
    let filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (category) {
      const cat = await Category.findOne({ $or: [{ name: category }, { slug: category }, { _id: category.length === 24 ? category : null }] });
      if (cat) filter.category = cat._id;
      else if (category.length === 24) filter.category = category;
    }

    let q = Product.find(filter).populate('category', 'name slug');
    if (sort === 'price-low') q = q.sort({ price: 1 });
    else if (sort === 'price-high') q = q.sort({ price: -1 });
    else if (sort === 'newest') q = q.sort({ createdAt: -1 });
    else q = q.sort({ createdAt: -1 });

    const products = await q.limit(Number(limit));
    res.json(products);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ GET ONE - /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) {
    res.status(404).json({ message: 'Product not found' });
  }
});

// ★★★ CATEGORY HELPER - Naam aaye to ID banao, Pehle jaisa Normal ★★★
const resolveCategory = async (catInput) => {
  if (!catInput) return null;
  if (typeof catInput === 'string' && catInput.length === 24) return catInput;
  const cat = await Category.findOne({
    $or: [
      { name: catInput },
      { slug: String(catInput).toLowerCase() },
      { name: { $regex: new RegExp('^' + catInput + '$', 'i') } }
    ]
  });
  if (cat) return cat._id;
  // Agar Category nahi mili to nayi bana do - taake 400 na aaye
  const newCat = await Category.create({
    name: catInput,
    slug: String(catInput).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  });
  return newCat._id;
};
// ★★★ SLUG - Naam se Khud Bana Dega, Frontend ko Bhejne ki Zaroorat Nahi ★★★
const makeSlug = (name) => {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-5);
};

// ✅ CREATE - /api/products - NORMAL, Koi Cloudinary Nahi
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) data.slug = makeSlug(data.name);
if (data.category) data.category = await resolveCategory(data.category);
    console.log('CREATE PRODUCT BODY:', data);
    if (data.category) data.category = await resolveCategory(data.category);
    // Image waisi hi aayegi jaisi Frontend bhej raha hai - Base64 / URL
    // data.image, data.images - koi upload nahi hoga
    const product = await Product.create(data);
    const populated = await Product.findById(product._id).populate('category', 'name slug');
    res.status(201).json(populated);
  } catch (e) {
    console.log('CREATE ERROR:', e.message);
    res.status(400).json({ message: e.message });
  }
});

// ✅ UPDATE - /api/products/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) data.slug = makeSlug(data.name);
    if (data.category) data.category = await resolveCategory(data.category);
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ★★★ BULK DELETE - Single delete se UPAR hona chahiye ★★★
router.delete('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'Koi product select nahi hai' });
    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} products delete ho gaye`, deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ message: 'Bulk delete fail: ' + e.message }); }
});

// ✅ BULK DELETE - Isko Hamesha /:id se UPAR rakhna hai
router.delete('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'ids array bhejo' });
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} products deleted` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ DELETE ONE
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;