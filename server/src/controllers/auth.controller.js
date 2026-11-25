import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateTokens, setAuthCookies, clearAuthCookies } from '../utils/generateTokens.js';

// REGISTER - Customer only, never admin from frontend
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 chars' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email: email.toLowerCase(), phone, password, role: 'customer' });
    const tokens = generateTokens(user._id, user.role);
    setAuthCookies(res, tokens);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// LOGIN - Customer + Admin same endpoint, role from DB
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended. Contact support.' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const tokens = generateTokens(user._id, user.role);
    setAuthCookies(res, tokens);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ME - Check who is logged in
export const me = async (req, res) => {
  res.json({ user: req.user });
};

// REFRESH
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const tokens = generateTokens(user._id, user.role);
    setAuthCookies(res, tokens);
    res.json({ ok: true });
  } catch (e) { res.status(401).json({ message: 'Refresh failed' }); }
};

export const logout = (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out' });
};

// FORGOT PASSWORD - Simple secure token flow
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  // Always return same message - don't reveal if email exists
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    console.log(`RESET LINK: http://localhost:5173/reset-password/${token}`);
    // Production me yahan email bhejenge
  }
  res.json({ message: 'If email exists, reset link sent' });
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } }).select('+password');
    if (!user) return res.status(400).json({ message: 'Token expired or invalid' });
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch { res.status(400).json({ message: 'Token expired or invalid' }); }
};