const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { wrap } = require('../utils/crud');
const { applyAction } = require('../services/notificationService');

exports.list = wrap(async (req, res) => {
  const f = { user: req.user._id };
  if (req.query.status) f.status = req.query.status;
  if (req.query.inapp) f.channel = { $ne: 'push' };
  res.json(await Notification.find(f).sort({ createdAt: -1 }).limit(50));
});
exports.act = wrap(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) { res.status(404); throw new Error('Not found'); }
  res.json(await applyAction(n, req.body.action, req.body.minutes));
});
// Used by the service-worker action buttons (no login cookie/localStorage there): short-lived signed token scoped to one notification.
exports.publicAction = wrap(async (req, res) => {
  let id; try { id = jwt.verify(req.params.token, process.env.JWT_SECRET).n; } catch { res.status(401); throw new Error('Invalid token'); }
  const n = await Notification.findById(id);
  if (!n) { res.status(404); throw new Error('Not found'); }
  res.json(await applyAction(n, req.params.action, req.query.minutes));
});
exports.key = (req, res) => res.json({ key: process.env.VAPID_PUBLIC_KEY || null });
exports.subscribe = wrap(async (req, res) => {
  const s = req.body.subscription;
  if (!s?.endpoint) { res.status(400); throw new Error('Invalid subscription'); }
  await User.updateOne({ _id: req.user._id }, { $pull: { pushSubscriptions: { endpoint: s.endpoint } } });
  await User.updateOne({ _id: req.user._id }, { $push: { pushSubscriptions: s } });
  res.json({ message: 'Subscribed' });
});
exports.unsubscribe = wrap(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { pushSubscriptions: { endpoint: req.body.endpoint } } });
  res.json({ message: 'Unsubscribed' });
});
