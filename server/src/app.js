import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import couponRoutes from './routes/coupons.routes.js';
import reviewRoutes from './routes/reviews.routes.js';
// ✅ SAHI - Ye likho
import backupRoutes from './routes/backup.js';

const app = express();

app.set('trust proxy', 1); // 👈 Ye add karo - Render pe IP sahi aayega

app.use(helmet());
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 200, // 1 IP se 15 min me sirf 200 request
  message: { message: 'Too many requests, thori der baad try karo.' }
}));

// ✅ SAARE ROUTES LIVE
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/backup', backupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, brand: 'TALHA Shopin Center' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;