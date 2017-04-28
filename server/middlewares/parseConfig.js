import useragent from 'useragent';
import _ from 'lodash';

export default function () {
  return function (req, res, next) {
    let serverConfig = req.app.locals.__server;

    res.locals.exposedServer = _.pick(
      serverConfig,
      [
        'h5root',
        'gateway',
        'usercenter',
        'mallHome',
        'mallGateway',
        'channelHome',
        'serverContext',
      ]
    );

    //Android应用市场渠道
    const androidAppChannels = [
      '_kxdyyb',
      '_kxdoppo',
      '_kxdmeizu',
      '_kxdlenovo',
      '_kxdvivo',
      '_kxd360sjzs',
      '_kxdxiaomi',
      '_kxdhuawei',
      '_kxdbaidusjzs',
      '_kxd91sjzs',
      '_kxdwdj',
      '_kxdaz',
      '_kxdlq',
      '_kxdyiyh',
      '_kxdjf',
      '_kxdyingyh',
      '_kxdmmy',
      '_kxdnd',
      '_kxdaliyyff',
      '_kxdydmm',
      '_kxddxty',
      '_kxdltwo',
      '_kxdyy',
    ];

    let channel = req.query.channel || '_kxd';
    let osAliasMap = {
      'android': 'Android',
      'ios': 'iOS',
    };

    // 开薪贷自定义User Agent: KaiXinDai/1.0.0 (iOS;Official)
    const kxdAgentRegex = new RegExp('KaiXinDai\/(\\d+\\.\\d+\\.\\d+)\\s+\\((.+?)\\)');

    const rawUA = req.headers['user-agent'];

    if (kxdAgentRegex.test(rawUA)) {
      let appVersion = RegExp.$1;
      let detail = RegExp.$2;
      channel = detail.replace(/\s+/g, '').split(';')[1];
      if (channel === 'Official') {
        channel = '_kxd';
      }

      res.locals.appVersion = appVersion;
      res.locals.isApp = true;
    } else {
      res.locals.appVersion = 'N/A';
      res.locals.isApp = false;
    }

    let ua = useragent.parse(rawUA);
    let os = ua.os.toJSON();
    let family = os.family.toLowerCase();
    let platform = family;

    res.locals.platform = platform;
    res.locals.osFamily = family;
    res.locals.osVersion = [os.major, os.minor, os.patch].join('.');
    res.locals.showNavBar = !res.locals.isApp;
    res.locals.showTabBar = !res.locals.isApp;

    //兼容带有后缀和不带有后缀的渠道信息
    res.locals.channel = channel;
    if (platform === 'android') {
      //是否为不需要后缀的应用商店渠道
      let isSpecialChannel = androidAppChannels.indexOf(channel) !== -1;

      //是否已经包含Android后缀
      let isSuffixed = /Android$/.test(channel);

      if (isSpecialChannel || isSuffixed) {
        //特殊应用商店渠道或者已添加后缀，无需要处理
        res.locals.channelCode = channel;
      } else {
        //添加Android后缀
        res.locals.channelCode = `${res.locals.channel}${osAliasMap[family] || ''}`;
      }
    } else if (platform === 'ios') {
      //iOS平台应用商店只有Apple Store，只需要检查是否包含iOS后缀
      let isSuffixed = /iOS$/.test(channel);

      if (isSuffixed) {
        //已添加后缀不处理
        res.locals.channelCode = channel;
      } else {
        //添加iOS后缀
        res.locals.channelCode = `${res.locals.channel}${osAliasMap[family] || ''}`;
      }
    } else {
      res.locals.channelCode = `${res.locals.channel}${osAliasMap[family] || ''}`;
    }

    next();
  };
}
