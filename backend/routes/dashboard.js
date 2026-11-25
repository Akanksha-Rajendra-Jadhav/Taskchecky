const r = require('express').Router();
const { protect } = require('../middleware/auth');
r.get('/', protect, require('../controllers/dashboardController').getDashboard);
module.exports = r;
