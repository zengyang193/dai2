import JSSHA from 'jssha';

let createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

let createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

let raw = function (args) {
  let keys = Object.keys(args);
  keys = keys.sort();
  let newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  let string = '';
  Object.keys(newArgs).forEach((k) => {
    string += '&' + k + '=' + newArgs[k];
  });
  string = string.substr(1);
  return string;
};

/**
 * @synopsis 签名算法
 *
 * @param jsapiTicket 用于签名的 jsapiTicket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
let sign = function (jsapiTicket, url) {
  let ret = {
    jsapi_ticket: jsapiTicket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url,
  };
  let string = raw(ret);

  let shaObj = new JSSHA('SHA-1', 'TEXT');

  shaObj.update(string);
  ret.signature = shaObj.getHash('HEX');

  return ret;
};

export default sign;
