const m = require('mongoose');
module.exports = m.model('Timetable', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  type: { type: String, enum: ['Study', 'Work', 'Meditation', 'Exercise', 'Break', 'Other'], default: 'Other' },
  days: { type: [Number], default: [] },
  start: { type: String, required: [true, 'Start time is required'], match: [/^\d\d:\d\d$/, 'Use HH:MM'] },
  end: { type: String, required: [true, 'End time is required'], match: [/^\d\d:\d\d$/, 'Use HH:MM'] },
  remindBefore: { type: Number, default: null, min: 0 },
  lastNotified: { type: String, default: '' }
}, { timestamps: true }));
