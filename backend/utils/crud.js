const express = require('express');
const { protect } = require('../middleware/auth');
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const notFound = (res) => { res.status(404); throw new Error('Not found'); };
exports.wrap = wrap;
exports.crud = (Model, allowed, { before, sort = { createdAt: -1 } } = {}) => {
  const pick = (b) => Object.fromEntries(allowed.filter(k => k in b).map(k => [k, b[k]]));
  return {
    list: wrap(async (req, res) => res.json(await Model.find({ user: req.user._id }).sort(sort))),
    create: wrap(async (req, res) => {
      const d = new Model({ ...pick(req.body), user: req.user._id });
      before && before(d); await d.save(); res.status(201).json(d);
    }),
    update: wrap(async (req, res) => {
      const d = await Model.findOne({ _id: req.params.id, user: req.user._id }); if (!d) notFound(res);
      d.set(pick(req.body)); before && before(d); await d.save(); res.json(d);
    }),
    remove: wrap(async (req, res) => {
      if (!(await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id }))) notFound(res);
      res.json({ message: 'Deleted' });
    })
  };
};
exports.router = (c, extra) => {
  const r = express.Router(); r.use(protect);
  extra && extra(r);
  r.route('/').get(c.list).post(c.create);
  r.route('/:id').put(c.update).delete(c.remove);
  return r;
};
