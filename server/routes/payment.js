import express from 'express';

let router = express.Router();
router.get('/*', function (req, res, next) {
  res.render('page/payment', {});
});

router.post('/success', function (req, res, next) {
  res.render('page/payment', {});
});

export default router;
