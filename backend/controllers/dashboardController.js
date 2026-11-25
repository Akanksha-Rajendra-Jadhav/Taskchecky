const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };

exports.getDashboard = async (req, res, next) => {
  try {
    const user = req.user._id;
    const now = new Date();
    const sod = new Date(now); sod.setHours(0, 0, 0, 0);
    const eod = new Date(sod); eod.setDate(eod.getDate() + 1);
    const weekStart = new Date(sod); weekStart.setDate(weekStart.getDate() - 6);

    const [total, completed, pending, overdue, todayTotal, todayDone, upcoming, weekDone] = await Promise.all([
      Task.countDocuments({ user }),
      Task.countDocuments({ user, status: 'Completed' }),
      Task.countDocuments({ user, status: { $ne: 'Completed' } }),
      Task.countDocuments({ user, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      Task.countDocuments({ user, dueDate: { $gte: sod, $lt: eod } }),
      Task.countDocuments({ user, dueDate: { $gte: sod, $lt: eod }, status: 'Completed' }),
      Task.find({ user, status: { $ne: 'Completed' }, dueDate: { $gte: now } }).sort({ dueDate: 1 }).limit(5),
      Task.find({ user, status: 'Completed', completedAt: { $gte: weekStart } }, 'completedAt')
    ]);

    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      return { key: dayKey(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }), completed: 0 };
    });
    weekDone.forEach(t => { const w = weekly.find(x => x.key === dayKey(t.completedAt)); if (w) w.completed++; });

    res.json({
      stats: { total, completed, pending, overdue },
      dailyProductivity: todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0,
      upcoming, weekly,
      reminders: await Reminder.find({ user, status: 'active', nextRun: { $gte: now } }).sort({ nextRun: 1 }).limit(5)
    });
  } catch (e) { next(e); }
};
