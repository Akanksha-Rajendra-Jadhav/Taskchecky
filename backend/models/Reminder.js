const m = require('mongoose');
module.exports = m.model('Reminder', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Custom' },
  nextRun: { type: Date, required: [true, 'Date and time are required'], index: true },
  repeat: { type: String, enum: ['once', 'daily', 'weekly', 'monthly', 'custom'], default: 'once' },
  customDays: { type: [Number], default: [] },
  notify: { type: String, enum: ['both', 'inapp', 'push'], default: 'both' },
  status: { type: String, enum: ['active', 'fired', 'done'], default: 'active' }, // fired = once-reminder awaiting completion
  snoozeUntil: { type: Date, default: null }
}, { timestamps: true }));
