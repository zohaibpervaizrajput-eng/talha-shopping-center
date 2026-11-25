import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

function makeSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// SAB CATEGORIES - Customer ke liye (Sirf Active)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const cats = await Category.find(filter).populate('parent', 'name slug').sort({ order: 1, createdAt: -1 });
    res.json(cats);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// EK CATEGORY + Uske Products - Product Page ke liye
router.get('/:id', async (req, res) => {
  try {
    let cat = await Category.findById(req.params.id);
    if (!cat) cat = await Category.findOne({ slug: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const products = await Product.find({ category: cat._id }).populate('category', 'name slug');
    res.json({ category: cat, products });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ADD - Admin Only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug) data.slug = makeSlug(data.name);
    else data.slug = makeSlug(data.slug);
    // Agar parent "" aaye to null kar do, warna MongoDB error dega
    if (!data.parent) data.parent = null;
    const c = await Category.create(data);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// UPDATE - Admin Only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.slug) data.slug = makeSlug(data.slug);
    if (!data.parent) data.parent = null;
    const c = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE - Admin Only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Pehle check karo is Category me Products to nahi
    const count = await Product.countDocuments({ category: req.params.id });
    if (count > 0) return res.status(400).json({ message: `Is Category me ${count} Products hain, pehle unko move ya delete karo` });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;