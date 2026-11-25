const Task = require('../models/Task');
const { crud, wrap } = require('../utils/crud');

const base = crud(Task, ['title', 'description', 'dueDate', 'priority', 'category', 'status'], {
  before: (d) => { if (d.status === 'Completed') d.completedAt = d.completedAt || new Date(); else d.completedAt = undefined; }
});
base.list = wrap(async (req, res) => {
  const { from, to, q, priority, status, category } = req.query;
  const f = { user: req.user._id };
  if (from || to) f.dueDate = { ...(from && { $gte: new Date(from) }), ...(to && { $lt: new Date(to) }) };
  if (q) f.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (priority) f.priority = priority;
  if (category) f.category = category;
  if (status === 'Overdue') { f.status = { $ne: 'Completed' }; f.dueDate = { ...f.dueDate, $lt: new Date() }; }
  else if (status) f.status = status;
  res.json(await Task.find(f).sort({ dueDate: 1, createdAt: -1 }));
});
module.exports = base;
