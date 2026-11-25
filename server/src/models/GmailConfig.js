import mongoose from 'mongoose';

const gmailConfigSchema = new mongoose.Schema({
  adminEmail: { type: String, default: '' }, // Jahan Order ki Email jani hai
}, { timestamps: true });

export default mongoose.model('GmailConfig', gmailConfigSchema);