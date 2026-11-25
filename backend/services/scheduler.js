const Reminder = require('../models/Reminder');
const Timetable = require('../models/Timetable');
const { notify } = require('./notificationService');
const { wd, parts } = require('../utils/time');

const userSel = { path: 'user', select: 'settings +pushSubscriptions' };
const tzOf = (u) => u?.settings?.timezone || 'UTC';

// Next occurrence strictly after `from`; loops so missed occurrences are skipped, not replayed.
function nextOccurrence(r, from, tz) {
  let n = new Date(r.nextRun);
  const custom = r.repeat === 'custom' && r.customDays.length;
  for (let i = 0; i < 5000; i++) {
    if (r.repeat === 'weekly') n = new Date(n.getTime() + 7 * 864e5);
    else if (r.repeat === 'monthly') { n = new Date(n); n.setMonth(n.getMonth() + 1); }
    else n = new Date(n.getTime() + 864e5);
    if (n > from && (!custom || r.customDays.includes(wd(n, tz)))) return n;
  }
  return new Date(from.getTime() + 864e5);
}
exports.nextOccurrence = nextOccurrence;

async function tickReminders(now) {
  const due = await Reminder.find({ status: 'active', $or: [{ snoozeUntil: { $lte: now } }, { snoozeUntil: null, nextRun: { $lte: now } }] }).populate(userSel);
  for (const r of due) {
    const set = { snoozeUntil: null };
    if (r.nextRun <= now) { if (r.repeat === 'once') set.status = 'fired'; else set.nextRun = nextOccurrence(r, now, tzOf(r.user)); }
    // compare-and-set: only one scheduler instance wins, so no duplicate notifications
    const res = await Reminder.updateOne({ _id: r._id, nextRun: r.nextRun, snoozeUntil: r.snoozeUntil ?? null, status: 'active' }, { $set: set });
    if (res.modifiedCount && r.user) await notify(r.user, { kind: 'reminder', reminder: r._id, title: r.title, body: r.description || 'Time for your reminder!', channel: r.notify });
  }
}

async function tickTimetable(now) {
  const entries = await Timetable.find({ remindBefore: { $ne: null } }).populate(userSel);
  for (const e of entries) {
    if (!e.user) continue;
    const p = parts(now, tzOf(e.user)); const [h, m] = e.start.split(':').map(Number); const start = h * 60 + m;
    if (!e.days.includes(p.wd) || p.mins < start - e.remindBefore || p.mins >= start || e.lastNotified === p.ymd) continue;
    const res = await Timetable.updateOne({ _id: e._id, lastNotified: { $ne: p.ymd } }, { $set: { lastNotified: p.ymd } });
    if (res.modifiedCount) await notify(e.user, { kind: 'timetable', title: e.title, body: `Starts at ${e.start}` });
  }
}

let running = false;
exports.start = () => {
  setInterval(async () => {
    if (running) return; running = true;
    try { const now = new Date(); await tickReminders(now); await tickTimetable(now); }
    catch (e) { console.error('scheduler error', e.message); } finally { running = false; }
  }, 15000);
  console.log('Reminder scheduler started (15s tick, state persisted in MongoDB)');
};
