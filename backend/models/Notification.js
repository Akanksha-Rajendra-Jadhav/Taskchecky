const m = require('mongoose');
module.exports = m.model('Notification', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['reminder', 'timetable'], default: 'reminder' },
  reminder: { type: m.Schema.Types.ObjectId, ref: 'Reminder' },
  title: String, body: String,
  channel: { type: String, enum: ['both', 'inapp', 'push'], default: 'both' },
  status: { type: String, enum: ['unread', 'completed', 'pending', 'snoozed', 'dismissed'], default: 'unread' },
  actedAt: Date
}, { timestamps: true }).index({ user: 1, status: 1 }));
