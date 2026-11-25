import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) { console.log('Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env'); process.exit(1); }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'super_admin';
    existing.password = password;
    await existing.save();
    console.log('Super Admin updated ✅', email);
  } else {
    await User.create({ name: 'TALHA Super Admin', email, password, role: 'super_admin', isEmailVerified: true });
    console.log('Super Admin created ✅', email);
  }
  process.exit(0);
};
run();