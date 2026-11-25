const { crud, router } = require('../utils/crud');
module.exports = router(crud(require('../models/Timetable'), ['title', 'type', 'days', 'start', 'end', 'remindBefore'], { sort: { start: 1 } }));
