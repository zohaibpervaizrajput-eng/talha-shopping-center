import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Coupon from '../models/Coupon.js';
import GmailConfig from '../models/GmailConfig.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const [products, orders, users, settings, coupons, gmailConfig] = await Promise.all([
      Product.find().lean(),
      Order.find().lean(),
      User.find().select('-password').lean(),
      Settings.find().lean(),
      Coupon.find().lean().catch(() => []),
      GmailConfig.find().lean().catch(() => []),
    ]);
    const backup = {
      createdAt: new Date().toISOString(),
      version: 'TSC-v1',
      counts: { products: products.length, orders: orders.length, users: users.length, coupons: coupons.length },
      data: { products, orders, users, settings, coupons, gmailConfig }
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=TSC-Backup-${new Date().toISOString().slice(0,10)}.json`);
    res.json(backup);
  } catch (e) { res.status(500).json({ message: 'Backup fail: ' + e.message }); }
});

router.post('/restore', protect, adminOnly, async (req, res) => {
  try {
    const backup = req.body;
    if (!backup?.data) return res.status(400).json({ message: 'Galat backup file hai' });

    // ★★★ Ye function updatedAt / createdAt / __v ko nikal dega - Yehi asal fix hai ★★★
    const clean = (doc) => {
      if (!doc) return doc;
      const d = { ...doc };
      delete d.__v;
      delete d.createdAt;
      delete d.updatedAt;
      return d;
    };

    let restored = {};
    if (backup.data.products?.length) {
      for (const p of backup.data.products) {
        const c = clean(p);
        await Product.updateOne({ _id: c._id }, { $setOnInsert: c }, { upsert: true, timestamps: false });
      }
      restored.products = backup.data.products.length;
    }
    if (backup.data.orders?.length) {
      for (const o of backup.data.orders) {
        const c = clean(o);
        await Order.updateOne({ orderNumber: c.orderNumber }, { $setOnInsert: c }, { upsert: true, timestamps: false });
      }
      restored.orders = backup.data.orders.length;
    }
    if (backup.data.coupons?.length) {
      for (const c of backup.data.coupons) {
        const cleaned = clean(c);
        await Coupon.updateOne({ code: cleaned.code }, { $setOnInsert: cleaned }, { upsert: true, timestamps: false });
      }
      restored.coupons = backup.data.coupons.length;
    }
    if (backup.data.settings?.length) {
      for (const s of backup.data.settings) {
        const cleaned = clean(s);
        await Settings.updateOne({ _id: cleaned._id }, { $setOnInsert: cleaned }, { upsert: true, timestamps: false });
      }
      restored.settings = backup.data.settings.length;
    }
    res.json({ message: `✅ Backup Restore Hogaya!`, restored });
  } catch (e) { res.status(500).json({ message: 'Restore fail: ' + e.message }); }
});
export default router;