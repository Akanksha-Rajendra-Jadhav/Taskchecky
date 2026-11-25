const Reminder = require('../models/Reminder');
const { crud, router } = require('../utils/crud');
const c = crud(Reminder, ['title', 'description', 'category', 'nextRun', 'repeat', 'customDays', 'notify'], {
  sort: { nextRun: 1 },
  // Editing a reminder into the future re-arms it
  before: (d) => { if (d.isModified('nextRun') && d.nextRun > new Date()) { d.status = 'active'; d.snoozeUntil = null; } }
});
module.exports = router(c);
