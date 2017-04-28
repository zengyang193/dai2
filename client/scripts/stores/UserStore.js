import {observable, action} from 'mobx';

import server from 'scripts/config/server';
import request from 'scripts/utils/request';

class UserStore {
  @observable authorization = {userId: '', token: ''};

  @action login = async (mobile, code) => {
    let authorization = await request.post(
      `${server.usercenter}/api/customers/captchaLogin`,
      {mobile, code}
    );
    this.authorization = {userId: authorization.userid, token: authorization.token};
    return authorization;
  }


  @action sendSmsCode = async (mobile) => {
    let encrptMobile = this.mencrypt(mobile);
    await request.post(`${server.usercenter}/api/sms/code`, {mobile: encrptMobile});
  }

  ttencrypt = require('jsencrypt');

  mencrypt (data) {
    let encrypt = new this.ttencrypt.JSEncrypt();

    encrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCA8ymOromuM/Vouztfe8FFZmzczFJXT/ExtmwGWqeoO5Ci6/BFcJS5cS6BNjcxjWAp6l0L5Alr9yQOiyvS2w3+ZaXl+Wb5MfGblT2DgbdOtouX2jdAFTAAIF62XiBCyA/MCOURaL4vdcFlgi2pd+X9Da4zKDh23nWQ9ozuh0DfNQIDAQAB');

    return encrypt.encrypt(data);
  }
}

export default UserStore;
