import mongoose from 'mongoose';
const s = new mongoose.Schema({ name: String, email: String, phone: String, subject: String, message: String, isRead: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('Contact', s);