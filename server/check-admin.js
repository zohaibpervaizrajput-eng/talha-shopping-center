import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@talhashopincenter.com' }).select('+password');
  console.log('User mila?', !!user);
  if (!user) { console.log('USER HI NAHI HAI'); process.exit(0); }
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password DB me:', user.password?.substring(0, 20));
  const match = await bcrypt.compare('admin.1234', user.password);
  console.log('Password match hua?', match);
  process.exit(0);
};
run();