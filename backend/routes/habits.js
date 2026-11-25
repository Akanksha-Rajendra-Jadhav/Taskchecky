const c = require('../controllers/habitController');
module.exports = require('../utils/crud').router(c, (r) => r.post('/:id/log', c.log));
