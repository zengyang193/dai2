'use strict';
import express from 'express';

let router = express.Router();
router.get('/*', function (req, res, next) {
  res.render('page/settings', {});
});


export default router;
