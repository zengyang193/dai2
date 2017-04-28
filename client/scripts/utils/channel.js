import queryString from 'query-string';

// 检查H5当前是否运行在功夫贷官方App或H5渠道
export function isOfficial () {
  let query = queryString.parse(window.location.search);

    // 无渠道相关标识时，默认为官方渠道
  if (
    typeof query.appId === 'undefined' &&
    typeof query.channel === 'undefined'
  ) {
    return true;
  }

    // appId或channel为官方标识时为官方渠道
  if (
    query.appId === 'gfdapp' ||
    query.appId === 'gfdappInhouse' ||
    query.channel === '_gfd'
  ) {
    return true;
  }

    // Android带有appName参数，值为'功夫贷'时为官方渠道
  if (query.appName === '功夫贷') {
    return true;
  }

  return false;
}

export function isSDK () {
  let query = queryString.parse(window.location.search);

    // sdk必然有appId参数，全h5接入无须appId
  if (query.appId && query.appId !== 'gfdapp') {
    return true;
  }

  return false;
}

export default {
  isOfficial: isOfficial,
  isSDK: isSDK,
};
