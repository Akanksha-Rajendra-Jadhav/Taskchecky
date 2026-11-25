const m = require('mongoose');
module.exports = m.model('Habit', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  icon: { type: String, default: '✅' }, unit: { type: String, default: 'time' },
  target: { type: Number, default: 1, min: 1 },
  logs: [{ _id: false, date: String, count: Number }]
}, { timestamps: true }));
