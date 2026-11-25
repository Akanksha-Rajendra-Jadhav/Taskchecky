const Task = require('../models/Task');
const Habit = require('../models/Habit');
const { wrap } = require('../utils/crud');
const { ymd, wd, DAYS } = require('../utils/time');
const { decorate } = require('./habitController');

const count = (arr, fn) => arr.reduce((m, t) => { const k = fn(t); m[k] = (m[k] || 0) + 1; return m; }, {});
exports.get = wrap(async (req, res) => {
  const tz = req.user.settings?.timezone || 'UTC';
  const [tasks, habits] = await Promise.all([Task.find({ user: req.user._id }, 'status completedAt createdAt'), Habit.find({ user: req.user._id })]);
  const done = tasks.filter(t => t.status === 'Completed' && t.completedAt);
  const byDay = count(done, t => ymd(t.completedAt, tz));
  const day = (i) => ymd(Date.now() - i * 864e5, tz);
  const daily = Array.from({ length: 14 }, (_, i) => { const k = day(13 - i); return { label: k.slice(5), value: byDay[k] || 0 }; });
  const weekly = Array.from({ length: 8 }, (_, w) => {
    let v = 0; for (let i = 0; i < 7; i++) v += byDay[day((7 - w) * 7 - 7 + i)] || 0;
    return { label: w === 7 ? 'This wk' : `-${7 - w}w`, value: v };
  });
  const doneM = count(done, t => ymd(t.completedAt, tz).slice(0, 7)), madeM = count(tasks, t => ymd(t.createdAt, tz).slice(0, 7));
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); const k = ymd(d, tz).slice(0, 7);
    return { label: k, value: doneM[k] || 0, created: madeM[k] || 0 };
  });
  const byWd = count(done, t => wd(t.completedAt, tz));
  const weekday = DAYS.map((l, i) => ({ label: l, value: byWd[i] || 0 }));
  const top = weekday.reduce((a, b) => (b.value > a.value ? b : a), { value: 0 });
  res.json({
    total: tasks.length, completed: tasks.filter(t => t.status === 'Completed').length,
    completionRate: tasks.length ? Math.round(tasks.filter(t => t.status === 'Completed').length / tasks.length * 100) : 0,
    daily, weekly, monthly, weekday, bestDay: top.value ? top.label : null,
    habits: habits.map(h => { const d = decorate(h, tz); return { name: h.name, icon: h.icon, streak: d.streak, week: d.week }; })
  });
});
