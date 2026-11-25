const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  completedAt: { type: Date }
}, { timestamps: true, toJSON: { virtuals: true } });
taskSchema.virtual('isOverdue').get(function () { return this.status !== 'Completed' && !!this.dueDate && this.dueDate < new Date(); });
module.exports = mongoose.model('Task', taskSchema);
