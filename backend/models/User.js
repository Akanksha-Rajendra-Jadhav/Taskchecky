const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notificationsEnabled: { type: Boolean, default: true },
    defaultSnooze: { type: Number, default: 5 }
  },
  pushSubscriptions: { type: [require('mongoose').Schema.Types.Mixed], select: false, default: [] },
  resetToken: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('User', userSchema);
