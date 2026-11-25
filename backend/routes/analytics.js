const r = require('express').Router();
r.get('/', require('../middleware/auth').protect, require('../controllers/analyticsController').get);
module.exports = r;
