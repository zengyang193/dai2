
import express from 'express';

let router = express.Router();

router.get('/operator', function (req, res, next) {
  res.render('page/operator', {});
});

router.get('/operator/success', function (req, res, next) {
  res.send('运营商登录成功');
});

router.get('/operator/:type', function (req, res, next) {
  res.render(`page/operator_${req.params.type}`, {});
});

router.get('/operator/:type/pwd', function (req, res, next) {
  res.render(`page/operator_${req.params.type}`, {});
});

export default router;

