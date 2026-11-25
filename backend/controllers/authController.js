const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const payload = (u) => ({ token: sign(u._id), user: { id: u._id, name: u.name, email: u.email, settings: u.settings } });
const fail = (res, code, msg) => { res.status(code); throw new Error(msg); };
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.register = wrap(async (req, res) => {
  const { name, email, password, timezone } = req.body;
  if (!name || !email || !password) fail(res, 400, 'Name, email and password are required');
  if (password.length < 6) fail(res, 400, 'Password must be at least 6 characters');
  const user = await User.create({ name, email, password, settings: timezone ? { timezone } : undefined });
  res.status(201).json(payload(user));
});

exports.login = wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) fail(res, 401, 'Invalid email or password');
  res.json(payload(user));
});

exports.me = wrap(async (req, res) => res.json({ user: req.user }));

exports.forgotPassword = wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  const msg = { message: 'If that email exists, a reset link has been generated.' };
  if (!user) return res.json(msg);
  const raw = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(raw).digest('hex');
  user.resetTokenExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const link = `${process.env.CLIENT_URL}/reset-password/${raw}`;
  console.log('PASSWORD RESET LINK (wire up email in production):', link);
  res.json(process.env.NODE_ENV === 'production' ? msg : { ...msg, devResetLink: link });
});

exports.resetPassword = wrap(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetToken: hashed, resetTokenExpires: { $gt: Date.now() } }).select('+resetToken +resetTokenExpires');
  if (!user) fail(res, 400, 'Reset link is invalid or has expired');
  if (!req.body.password || req.body.password.length < 6) fail(res, 400, 'Password must be at least 6 characters');
  user.password = req.body.password;
  user.resetToken = undefined; user.resetTokenExpires = undefined;
  await user.save();
  res.json(payload(user));
});

exports.updateProfile = wrap(async (req, res) => {
  const { name, email, settings = {} } = req.body; const u = req.user;
  if (name) u.name = name; if (email) u.email = email;
  if (settings.timezone) { try { new Intl.DateTimeFormat('en', { timeZone: settings.timezone }); } catch { fail(res, 400, 'Invalid timezone'); } }
  ['theme', 'timezone', 'notificationsEnabled', 'defaultSnooze'].forEach(k => { if (k in settings) u.settings[k] = settings[k]; });
  await u.save(); res.json({ user: u });
});
exports.changePassword = wrap(async (req, res) => {
  const u = await User.findById(req.user._id).select('+password');
  if (!(await u.matchPassword(req.body.currentPassword || ''))) fail(res, 400, 'Current password is incorrect');
  if (!req.body.newPassword || req.body.newPassword.length < 6) fail(res, 400, 'New password must be at least 6 characters');
  u.password = req.body.newPassword; await u.save(); res.json({ message: 'Password updated' });
});
