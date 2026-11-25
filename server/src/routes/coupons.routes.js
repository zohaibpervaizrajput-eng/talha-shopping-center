import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

// ✅ COUPON CHECK KARO - Checkout pe Customer yehi bulayega
// POST /api/coupons/validate -> { code: 'EID50', orderTotal: 5000 }
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code bhejo' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: 'Galat coupon code' });
    if (!coupon.isActive) return res.status(400).json({ message: 'Ye coupon band hai' });
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Ye coupon expire ho gaya' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Ye coupon ki limit khatam ho gayi' });
    }
    if (Number(orderTotal) < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Is coupon ke liye kam se kam Rs. ${coupon.minOrderAmount} ka order chahiye` });
    }

    // Discount hisaab karo
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((Number(orderTotal) * coupon.value) / 100);
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'free_shipping') {
      discount = 0; // Shipping alag se free hogi, Frontend me handle karenge
    }

    res.json({ valid: true, coupon, discount, type: coupon.type, message: 'Coupon lag gaya! 🎉' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// SAB COUPONS - Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('applicableCategories', 'name').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ADD - Admin Only
// { code: 'EID50', type: 'percentage', value: 50, maxDiscount: 1000, minOrderAmount: 2000 }
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase().trim();
    const c = await Coupon.create(data);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// UPDATE - Admin Only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase().trim();
    const c = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE - Admin Only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Coupon.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;