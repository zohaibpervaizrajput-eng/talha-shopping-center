import express from 'express';
import Order from '../models/Order.js';
import nodemailer from 'nodemailer';
import Product from '../models/Product.js';
import GmailConfig from '../models/GmailConfig.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

// ★★★ Order Number - Duplicate kabhi nahi hoga ★★★
async function makeOrderNumber() {
  const all = await Order.find({}, 'orderNumber').lean();
  let max = 1000;
  for (const o of all) {
    const n = parseInt(String(o.orderNumber || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return 'TSC-' + (max + 1);
}

// ★★★ GMAIL NOTIFICATION - Admin Panel wali Gmail pe jayegi ★★★
const sendEmailNotification = async (order) => {
  try {
    const gmailConfig = await GmailConfig.findOne();
    const toEmail = gmailConfig?.adminEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
      },
    });
    const itemsText = order.items.map(i => `${i.name} x ${i.qty} = Rs.${i.price * i.qty}`).join('\n');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `🛍️ NEW ORDER - ${order.orderNumber} - Rs.${order.total}`,
      text: `NEW ORDER - ${order.orderNumber}\n\nCustomer: ${order.shippingAddress?.fullName}\nPhone: ${order.shippingAddress?.phone}\nAddress: ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.province}\n\nItems:\n${itemsText}\n\nSubtotal: Rs.${order.subtotal}\nShipping: Rs.${order.shippingCharges}\nDiscount: Rs.${order.discount}\nTotal: Rs.${order.total}\nPayment: ${order.paymentMethod}`,
    });
    console.log('✅ Email bhej di -', order.orderNumber, '->', toEmail);
    return true;
  } catch (e) {
    console.log('❌ Email Error:', e.message);
    return false;
  }
};

// ★★★ STOCK WAPAS KARO - Cancel hone pe ★★★
const restoreStock = async (items) => {
  for (const item of items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } }).catch(() => {});
    }
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { _id: decoded.id, role: decoded.role, email: decoded.email };
  } catch(e) {}
  next();
};

// ★★★ GMAIL SETTING - Admin Panel se dusre mobile ka Gmail lagao ★★★
router.get('/gmail-config', protect, adminOnly, async (req, res) => {
  try {
    let config = await GmailConfig.findOne();
    if (!config) config = await GmailConfig.create({ adminEmail: process.env.ADMIN_EMAIL || '' });
    res.json(config);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/gmail-config', protect, adminOnly, async (req, res) => {
  try {
    const { adminEmail } = req.body;
    let config = await GmailConfig.findOne();
    if (!config) config = new GmailConfig({});
    if (adminEmail !== undefined) config.adminEmail = String(adminEmail).trim();
    await config.save();
    res.json({ message: '✅ Gmail save ho gayi', config });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// POST - Test Button - Gmail Test karega
router.post('/gmail-test', protect, adminOnly, async (req, res) => {
  try {
    const fakeOrder = {
      orderNumber: 'TEST-1001',
      items: [{ name: 'Test Product', qty: 1, price: 2500 }],
      shippingAddress: { fullName: 'Test Customer', phone: '0300-1234567', address: 'Test Address', city: 'Sialkot', province: 'Punjab' },
      subtotal: 2500, shippingCharges: 250, discount: 0, total: 2750, paymentMethod: 'COD', couponCode: ''
    };
    const ok = await sendEmailNotification(fakeOrder);
    if (!ok) return res.status(400).json({ message: 'Email nahi gayi - .env me EMAIL_USER / EMAIL_PASS check karo' });
    res.json({ message: '✅ Test Email bhej di - Gmail check karen' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ★★★ ORDER KARO - FINAL FIXED VERSION ★★★
router.post('/', optionalAuth, async (req, res) => {
  // Stock wapas karne ke liye track karenge kya minus hua
  const deducted = [];
  try {
    const { customerName, phone, email, address, city, province, area, postalCode, instructions, items, paymentMethod, couponCode, discount } = req.body;

    // ===== FIX 4: VALIDATION =====
    if (!customerName || !phone || !address || !city)
      return res.status(400).json({ message: 'Name, Phone, Address, City is important' });
    if (!/^(03\d{9}|92\d{10})$/.test(String(phone).replace(/[\s-]/g, '')))
      return res.status(400).json({ message: 'Valid Mobile number - 03xx-xxxxxxx' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart empty' });

    // ===== FIX 1: PRICE HAMESHA DATABASE SE =====
    const orderItems = [];
    for (const it of items) {
      const prodId = it.productId || it.product || it._id;
      const prod = await Product.findById(prodId);
      if (!prod) throw new Error('Product not found, Try Again');
      const qty = Number(it.quantity || it.qty || 1);
      if (qty < 1) throw new Error('wrong quantity');
      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: Number(prod.salePrice || prod.price || 0), // ★ Customer ki price nahi, DB ki ★
        qty,
        size: it.size || '',
        image: prod.images?.[0]?.url || prod.image || it.image || '',
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    // Shipping aur Discount bhi Server pe calculate hota hai, Customer wala nahi maante
    // Filhal frontend se shipping le rahe hain, lekin Total hum khud banayenge
    const ship = Number(req.body.shippingCharges || 0);
    const disc = Number(discount || 0);
    const finalTotal = Math.max(0, subtotal - disc + ship);

    // ===== FIX 2: STOCK ATOMIC + CHECK =====
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } }, // Stock hai tabhi minus karo
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updated) throw new Error(`${item.name} - This Product is Out of Stock now`);
      deducted.push(item); // Agar aage fail hua to ye wapas karenge
    }

    let order = null;
    let lastErr = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await Order.create({
          orderNumber: await makeOrderNumber(),
          user: req.user?._id || null,
          items: orderItems,
          shippingAddress: {
            fullName: customerName || req.body.fullName || 'Customer',
            phone: phone || '',
            email: email || '',
            province: province || '',
            city: city || '',
            area: area || '',
            address: address || '',
            postalCode: postalCode || '',
            instructions: instructions || '',
          },
          paymentMethod: ['COD', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Card'].includes(paymentMethod) ? paymentMethod : 'COD',
          paymentStatus: 'pending',
          subtotal,
          discount: disc,
          shippingCharges: ship,
          tax: Number(req.body.tax || 0),
          total: finalTotal,
          couponCode: couponCode || '',
          status: 'Pending',
          statusHistory: [{ status: 'Pending', note: 'Order placed' }],
        });
        break;
      } catch (err) {
        lastErr = err;
        if (err.code === 11000) continue;
        throw err;
      }
    }
    if (!order) throw lastErr;

    sendEmailNotification(order).catch(() => {});
    res.status(201).json(order);
  } catch (e) {
    // ===== AGAR ORDER FAIL HUA TO STOCK WAPAS KARO =====
    if (deducted.length > 0) await restoreStock(deducted);
    res.status(400).json({ message: e.message });
  }
});

// SAARE ORDERS - Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ★★★ MERE ORDERS - Login Customer ★★★
router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;
    const query = { $or: [{ user: userId }] };
    if (userEmail) query.$or.push({ 'shippingAddress.email': userEmail });
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ★★★ MY ACCOUNT SE CANCEL - Customer ★★★
router.put('/my/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id || req.user.id });
    if (!order) return res.status(404).json({ message: 'order not found' });
    if (['Pending', 'Confirmed', 'Packed', 'Processing','Shipped','Delivered'].includes(order.status))  {
      return res.status(400).json({ message: `This Order is not Cancelled now - Status: ${order.status}` });
    }
    // ★★★ FIX 3: Cancel pe Stock wapas ★★★
    await restoreStock(order.items);
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Customer Cancelled Order from his Account' });
    await order.save();
    res.json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// EK ORDER - Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const o = await Order.findById(req.params.id).populate('user', 'name email');
    if (!o) return res.status(404).json({ message: 'Order not found' });
    res.json(o);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// STATUS BADLO - Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note, courier, trackingNumber } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Galat status hai' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled order status could not changed' });
    if (order.status === 'Delivered' && status !== 'Delivered') return res.status(400).json({ message: 'Delivered order could not Returned' });

    // ★★★ Admin ne Cancel kiya to Stock wapas ★★★
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await restoreStock(order.items);
    }

    order.status = status;
    if (courier) order.courier = courier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.statusHistory.push({ status, note: note || `Status changed to ${status}` });
    await order.save();
    res.json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE - Admin - Stock wapas karke delete karo
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Agar Pending/Confirmed hai to Stock wapas karo, Delivered ka nahi
    if (['Pending', 'Confirmed', 'Processing'].includes(order.status)) {
      await restoreStock(order.items);
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  }
  catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;