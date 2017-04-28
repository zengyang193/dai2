import {observable, action} from 'mobx';

import server from 'scripts/config/server';
import request from 'scripts/utils/request';

class OperatorLoginStore {
  @observable loginTip = [];
  @observable loginCaptcha = null;
  resetPwdConfig = null;

  @action fetchLoginPageRequest = async (key, showLoading = false) => {
    return request.post(`${server.gateway}/basics/member/loginpage`, {key}, {showLoading});
  }

  @action fetchForgetPasswordConfigRequest = async (key) => {
    try {
      let resetPwdConfig = await request.post(
        `${server.gateway}/basics/member/resetPwd/config`,
        {key},
        {showLoading: false}
      );
      this.resetPwdConfig = resetPwdConfig;
    } catch (ex) {
      console.error(ex);
    }
  }

  @action refreshCaptchaCodeRequest = async (key) => {
    this.loginCaptcha = null;

    let data = await request.post(
      `${server.gateway}/basics/member/refresh_code`,
      {key},
      {showLoading: false, showError: false}
    );

    this.loginCaptcha = `data:image/png;base64,${data}`;
  }

  async refreshCaptchaCodeV1Request (key, mobile) {
    return await request.post(
      `${server.gateway}/basics/member/refresh_code/v1`,
      {key, mobile},
      {showLoading: true, showError: false}
    );
  }

  @action fetchOperatorTipRequest = async (key) => {
    try {
      let loginTip = await request.post(
        `${server.gateway}/basics/member/loginTip`,
        {key},
        {showLoading: false, showError: false}
      );
      this.loginTip = loginTip ? loginTip.split(/\n/) : [];
    } catch (ex) {
      console.error(ex);
    }
  }

  @action loginRequest = async (key, username, password, code = '') => {
    return request.post(
      `${server.gateway}/basics/member/login`,
      {username, password, code, key},
      {showError: false},
    );
  }

  async loginV1Request (key, username, password, randomPassword, code = '') {
    return await request.post(`${server.gateway}/basics/member/login/v1`, {
      username,
      password,
      randomPassword,
      code,
      key,
    }, {
      showError: false,
    });
  }

  async fetchCertificationInfoRequest () {
    return await request.post(`${server.gateway}/idcard/info`);
  }

  async sendVerificationCode (key, code) {
    return await request.post(`${server.gateway}/basics/member/smsLogin`, {key, code}, {showError: false});
  }
}

export default OperatorLoginStore;

