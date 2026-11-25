import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');

  const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

  console.log('Ban raha hai:', email);

  await User.deleteOne({ email });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name: 'TALHA Super Admin',
    email: email,
    password: password,
    role: 'admin'
  });

  console.log('HO GAYA! Admin ban gaya');
  process.exit(0);
};

run();