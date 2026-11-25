const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');
const { sendPush } = require('./push');

exports.notify = async (user, data) => {
  if (user.settings?.notificationsEnabled === false) return null;
  const n = await Notification.create({ user: user._id, ...data });
  if (n.channel !== 'inapp') await sendPush(user, n).catch(e => console.error('push failed', e.message));
  return n;
};

// Idempotent: only an unread notification can be acted on, so double clicks / push+in-app races are harmless.
exports.applyAction = async (n, action, minutes = 5) => {
  if (n.status !== 'unread') return n;
  if (action === 'completed') {
    n.status = 'completed';
    if (n.reminder) await Reminder.updateOne({ _id: n.reminder, repeat: 'once' }, { $set: { status: 'done' } });
  } else if (action === 'snooze') {
    n.status = 'snoozed';
    const mins = Math.min(Math.max(Number(minutes) || 5, 1), 180);
    if (n.reminder) await Reminder.updateOne({ _id: n.reminder }, { $set: { snoozeUntil: new Date(Date.now() + mins * 60000), status: 'active' } });
  } else if (action === 'pending') n.status = 'pending';
  else n.status = 'dismissed';   // dismissing never completes anything
  n.actedAt = new Date();
  return n.save();
};
