import axios from 'axios';
import queryString from 'query-string';
import merge from 'lodash/merge';
import ModalUtil from 'scripts/utils/modal';
import UserUtil from 'scripts/utils/user';

axios.defaults.data = UserUtil.fetchAuthorization();
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axios.interceptors.request.use(function (config) {
  if (config.showLoading) {
    ModalUtil.showPreloader();
  }
  return config;
}, function (error) {
  const config = error.config;
  if (config.showLoading) {
    ModalUtil.hidePreloader();
  }
  return Promise.reject(error);
});


axios.interceptors.response.use(function (response) {
  const config = response.config;
  if (config.showLoading) {
    ModalUtil.hidePreloader();
  }
  return response.data.data;
}, function (error) {
  const config = error.config;
  const response = error.response;
  if (config.showLoading) {
    ModalUtil.hidePreloader();
  }
  if (config.showError) {
    ModalUtil.toast(response.data.errorMsg);
  }
  return Promise.reject(response);
});

function _sendEncryptedRequest (method, url, params, config) {
  let cfg = merge(config, {method, url});

  return new Promise((resolve, reject) => {
    async function handler (result) {
      try {
        switch (method) {
        case 'post':
          cfg.data = queryString.stringify(result.data);
          break;
        case 'get':
          cfg.params = queryString.stringify(result.data);
        }
        let data = await axios(cfg);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    }

    if (!window.JSBridge) {
      document.addEventListener('JSBridgeReady', () => {
        JSBridge.callNative('Encrypt.encrypt', {params}, handler);
      });
    } else {
      JSBridge.callNative('Encrypt.encrypt', {params}, handler);
    }
  });
}

export default {
  post: function (url, params, config) {
    params = merge(UserUtil.fetchAuthorization(), {channel: __CHANNEL_CODE__}, params);
    config = merge({showLoading: true, showError: true}, config);
    if (__IS_APP__) {
      return _sendEncryptedRequest('post', url, params, config);
    } else {
      return axios.post(url, queryString.stringify(params), config);
    }
  },
  get: function (url, params, config) {
    params = merge(UserUtil.fetchAuthorization(), {channel: __CHANNEL_CODE__}, params);
    config = merge({showLoading: true, showError: true}, config);
    if (__IS_APP__) {
      return _sendEncryptedRequest('get', url, params, config);
    } else {
      return axios.get(url, params, config);
    }
  },
};
