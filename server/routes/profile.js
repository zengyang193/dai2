import express from 'express';

let router = express.Router();
router.get('/*', function (req, res, next) {
  res.render('page/profile', {});
});

export default router;

