import User from '../models/User.js';
import jwt from 'jsonwebtoken';


export const protect = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not logged in, no token' });

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'talha_secret_key_123';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User nahi mila' });
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-Based Access Control
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not logged in' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  next();
};
// products.routes.js isko mangta hai
export const adminOnly = (req, res, next) => {
  const allowed = ['admin','super_admin','product_manager','order_manager','inventory_manager','support','delivery_manager'];
  if (!allowed.includes(req.user.role)) return res.status(403).json({message: 'Admin only'});
  next();
}

// Purane naam ke liye bhi rakh do taake kahin aur error na aaye
export const admin = adminOnly;

export const requireAdmin = requireRole('admin','super_admin','product_manager','order_manager','inventory_manager','support','delivery_manager');