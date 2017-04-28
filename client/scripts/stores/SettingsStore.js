import {observable, action} from 'mobx';
import request from 'scripts/utils/request';

import server from 'scripts/config/server';

class SettingsStore {

  @observable loanList;
  @observable userMobile;

  @action fetchMyLoanList = async() => {
    try {
      let result = await request.post(`${server.gateway}/loan/list`);
      this.loanList = result;
    } catch (ex) {
      console.error(ex);
    }
  }

  @action fetchUserInfo = async() => {
    try {
      let result = await request.post(`${server.gateway}/user/info`, {}, {showLoading: false});
      this.userMobile = result.mobile;
    } catch (ex) {
      console.error(ex);
    }
  }

}

export default SettingsStore;
