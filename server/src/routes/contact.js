import express from 'express';
import Contact from '../models/Contact.js';
const r = express.Router();
r.post('/', async (req, res) => { try { const c = await Contact.create(req.body); res.json({ success: true, contact: c }); } catch (e) { res.status(500).json({ message: 'Failed' }); } });
r.get('/', async (req, res) => { const list = await Contact.find().sort({ createdAt: -1 }); res.json(list); });
export default r;
// server.js me: app.use('/api/contact', contactRoutes);