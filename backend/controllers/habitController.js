const Habit = require('../models/Habit');
const { crud, wrap } = require('../utils/crud');
const { ymd } = require('../utils/time');

const lastDays = (n, tz) => Array.from({ length: n }, (_, i) => ymd(Date.now() - (n - 1 - i) * 864e5, tz));
const decorate = (h, tz) => {
  const map = Object.fromEntries(h.logs.map(l => [l.date, l.count]));
  const week = lastDays(7, tz).map(d => ({ date: d, count: map[d] || 0, done: (map[d] || 0) >= h.target }));
  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    if ((map[ymd(Date.now() - i * 864e5, tz)] || 0) >= h.target) streak++; else if (i > 0) break;
  }
  const o = h.toObject(); delete o.logs;
  return { ...o, today: week[6], week, streak };
};
const tzOf = (req) => req.user.settings?.timezone || 'UTC';
const c = crud(Habit, ['name', 'icon', 'unit', 'target']);
c.list = wrap(async (req, res) => res.json((await Habit.find({ user: req.user._id }).sort({ createdAt: 1 })).map(h => decorate(h, tzOf(req)))));
c.log = wrap(async (req, res) => {
  const { date, count } = req.body;
  if (!/^\d{4}-\d\d-\d\d$/.test(date || '')) { res.status(400); throw new Error('Invalid date'); }
  const h = await Habit.findOne({ _id: req.params.id, user: req.user._id });
  if (!h) { res.status(404); throw new Error('Not found'); }
  const v = Math.max(0, Number(count) || 0); const l = h.logs.find(x => x.date === date);
  l ? (l.count = v) : h.logs.push({ date, count: v });
  await h.save(); res.json(decorate(h, tzOf(req)));
});
c.decorate = decorate;
module.exports = c;
