import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

// ✅ KISI PRODUCT KE REVIEWS - Website pe sirf Approved dikhenge
// GET /api/reviews/product/PRODUCT_ID
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ REVIEW LIKHO - Login Customer
// POST /api/reviews -> { product: 'ID', rating: 5, comment: 'Boht acha hai' }
router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    if (!product || !rating) return res.status(400).json({ message: 'Product aur Rating zaroori hai' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating 1 se 5 tak ho' });

    // Ek user ek product pe ek hi review de sakta hai - purana hai to update kar do
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || '';
      existing.isApproved = false; // Dobara approve hoga
      await existing.save();
      return res.json({ message: 'Review update ho gaya, Admin approve karega', review: existing });
    }

    const r = await Review.create({ product, user: req.user._id, rating, comment: comment || '', isApproved: false });
    res.status(201).json({ message: 'Review bhej diya, Admin approve karega', review: r });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// SAB REVIEWS - Admin Only (Approved + Pending sab)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name email').populate('product', 'name images').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// APPROVE / REJECT - Admin Only
// PUT /api/reviews/:id/approve -> { isApproved: true }
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved ?? true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Product ki Average Rating update karo
    const approved = await Review.find({ product: review.product, isApproved: true });
    if (approved.length > 0) {
      const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
      await Product.findByIdAndUpdate(review.product, { rating: Math.round(avg * 10) / 10, numReviews: approved.length }).catch(() => {});
    }
    res.json(review);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ADMIN REPLY - Admin Only
// PUT /api/reviews/:id/reply -> { adminReply: 'Shukriya!' }
router.put('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.adminReply || '' }, { new: true });
    res.json(review);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE - Admin Only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;