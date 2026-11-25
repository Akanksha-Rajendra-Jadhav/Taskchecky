const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const enabled = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (enabled) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
else console.warn('VAPID keys missing: Web Push disabled (in-app notifications still work).');

exports.enabled = enabled;
exports.sendPush = async (user, n) => {
  const subs = user.pushSubscriptions || [];
  if (!enabled || !subs.length) return;
  const payload = JSON.stringify({ id: n._id, title: n.title, body: n.body, kind: n.kind, api: process.env.API_PUBLIC_URL,
    snooze: user.settings?.defaultSnooze || 5, token: jwt.sign({ n: n._id }, process.env.JWT_SECRET, { expiresIn: '1d' }) });
  const dead = [];
  await Promise.all(subs.map(s => webpush.sendNotification(s, payload).catch(e => { if ([404, 410].includes(e.statusCode)) dead.push(s.endpoint); })));
  if (dead.length) await User.updateOne({ _id: user._id }, { $pull: { pushSubscriptions: { endpoint: { $in: dead } } } });
};
