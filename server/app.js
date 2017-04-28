'use strict';

import express from 'express';
import logger from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ReactViews from 'express-react-views';
import FileStreamRotator from 'file-stream-rotator';
import compression from 'compression';
import fs from 'fs';
import server from './config/server';

// Routes
import IndexRouter from './routes/index';
import ProfileRouter from './routes/profile';
import ApplicationRouter from './routes/application';
import SimulateLoginRouter from './routes/simulateLogin';
import FAQRouter from './routes/faq';
import AgreementRouter from './routes/agreement';
import SettingsRouter from './routes/settings';
import PaymentRouter from './routes/payment';

// Middlewares
import assetsManifest from './middlewares/assetsManifest';
import parseConfig from './middlewares/parseConfig';

// 日志路径
let logDirectory = __dirname + '/logs';

global.__base = __dirname; // 设置全局引用路径
global.__server = server;
global.__DEV__ = process.env.NODE_ENV === 'development';

let app = express();

// Webpack Hot Module Replacement配置
if (__DEV__) {
  const webpack = require('webpack');
  const webpackConfig = require('../webpack/client/webpackDevConfig');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    lazy: false,
    quiet: false,
    noInfo: false,
    stats: {colors: true},
    publicPath: webpackConfig.output.publicPath,
    historyApiFallback: true,
  }));
  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  }));
}

app.use(server.serverContext, express.static(path.join(__dirname, '../client')));

// 服务器配置文件
app.locals.__server = __server;

// Express模板引擎配置
app.set('views', `${__base}/views`);
if (__DEV__) {
  app.set('view engine', 'jsx');
  app.engine('jsx', ReactViews.createEngine({transformViews: true}));
} else {
  app.set('view engine', 'js');
  app.engine('js', ReactViews.createEngine({transformViews: false}));
}

if (__DEV__) {
  app.use(logger('dev'));
} else {
  app.use(compression());
  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  // create a rotating write stream
  let accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYY-MM-DD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false,
  });
  app.use(logger('combined', {stream: accessLogStream}));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(parseConfig());
app.use(assetsManifest(`${__base}/views/assetsManifest.json`));

app.use(server.serverContext, IndexRouter);
app.use(server.serverContext + '/profile', ProfileRouter);
app.use(server.serverContext + '/application', ApplicationRouter);
app.use(server.serverContext + '/slogin', SimulateLoginRouter);
app.use(server.serverContext + '/faq', FAQRouter);
app.use(server.serverContext + '/agreement', AgreementRouter);
app.use(server.serverContext + '/settings', SettingsRouter);
app.use(server.serverContext + '/payment', PaymentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (__DEV__) {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

export default app;
