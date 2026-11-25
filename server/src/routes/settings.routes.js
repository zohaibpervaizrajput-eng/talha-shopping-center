import express from 'express';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

const DEFAULTS = {
  site: {
    storeName: 'TALHA Shoping Center',
    phone: '0307-6128103',
    whatsapp: '0307-6128103',
    email: 'info@talha.com',
    announcement: '🔥 EID SALE - 50% OFF on All Jewellery! Free Delivery over Rs. 5000',
  },
  shipping: {
    deliveryCharge: 250,
    freeDeliveryAbove: 5000,
    freeDeliveryEnabled: true,
  },
  payment: {
    cod: true,
    jazzCash: true,
    easypaisa: true,
    bankTransfer: false,
  },
};

// ✅ GET /api/settings
router.get('/', async (req, res) => {
  try {
    const all = await Settings.find();
    const merged = { ...DEFAULTS.site, ...DEFAULTS.shipping, ...DEFAULTS.payment };
    for (const doc of all) {
      Object.assign(merged, doc.data);
    }
    // ★★★ FIX: shipping ab DEFAULTS se nahi, merged se aayega ★★★
    res.json({
      ...merged,
      site: merged,
      shipping: {
        deliveryCharge: merged.deliveryCharge,
        freeDeliveryAbove: merged.freeDeliveryAbove,
        freeDeliveryEnabled: merged.freeDeliveryEnabled,
      },
      payment: {
        cod: merged.cod,
        jazzCash: merged.jazzCash,
        easypaisa: merged.easypaisa,
        bankTransfer: merged.bankTransfer,
      },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:key', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: req.params.key });
    if (!doc) return res.json(DEFAULTS[req.params.key] || {});
    res.json(doc.data);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ PUT /api/settings
router.put('/:key?', protect, adminOnly, async (req, res) => {
  try {
    const key = req.params.key || 'site';
    if (!req.params.key) {
      const body = req.body;
      const siteData = {};
      const shipData = {};
      const payData = {};
      for (const k in body) {
        if (['storeName', 'phone', 'whatsapp', 'email', 'announcement'].includes(k)) siteData[k] = body[k];
        // ★★★ FIX: freeDeliveryEnabled + minOrder bhi shipping me ★★★
        else if (['deliveryCharge', 'freeDeliveryAbove', 'freeDeliveryEnabled', 'minOrder'].includes(k)) shipData[k] = body[k];
        else if (['cod', 'jazzCash', 'easypaisa', 'bankTransfer'].includes(k)) payData[k] = body[k];
        else siteData[k] = body[k];
      }

      // ★★★ FIX: Purana data pehle lao, phir usme naya milao - DEFAULTS se overwrite mat karo ★★★
      const savePart = async (k, defaults, newPart) => {
        if (!Object.keys(newPart).length) return;
        const existing = await Settings.findOne({ key: k });
        const newData = { ...defaults, ...(existing?.data || {}), ...newPart };
        await Settings.findOneAndUpdate({ key: k }, { key: k, data: newData }, { upsert: true, new: true });
      };

      await savePart('site', DEFAULTS.site, siteData);
      await savePart('shipping', DEFAULTS.shipping, shipData);
      await savePart('payment', DEFAULTS.payment, payData);

      // Turant naya merged data wapas bhejo
      const all = await Settings.find();
      const merged = { ...DEFAULTS.site, ...DEFAULTS.shipping, ...DEFAULTS.payment };
      for (const doc of all) Object.assign(merged, doc.data);
      return res.json({ message: 'Settings saved', data: merged });
    }

    const existing = await Settings.findOne({ key });
    const newData = { ...(DEFAULTS[key] || {}), ...(existing?.data || {}), ...req.body };
    const doc = await Settings.findOneAndUpdate({ key }, { key, data: newData }, { upsert: true, new: true });
    res.json(doc.data);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;