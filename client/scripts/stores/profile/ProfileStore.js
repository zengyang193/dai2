import {observable, action, computed} from 'mobx';
import merge from 'lodash/merge';
import server from 'scripts/config/server';
import request from 'scripts/utils/request';

class ProfileStore {
  _defaultStatus = {
    hasOperate: false,
    status: -1,
    msg: '',
    title: '',
  };

  @observable config = {
    OPERATOR: {
      importNum: {},
      list: [],
    },
  };
  @observable statusPolling = false;

  @observable _currentStep = null;
  @computed.struct get currentStep () {
    return this._currentStep;
  }

  @observable _status = this._defaultStatus;
  @computed.struct get status () {
    return this._status;
  }

  @observable _operate = [];
  @computed.struct get operate () {
    return this._operate;
  }

  @action fetchStepConfiguration = async (step) => {
    let config = await request.post(`${server.gateway}/basics/${step}/config/vkxd`);
    this.config[step] = config;
    return config;
  }

  @action setCurrentStep (step) {
    if (this.currentStep !== step) {
      this._currentStep = step;
      this._status = this._defaultStatus;
    }
  }

  @action fetchCurrentStep = async () => {
    let step = await request.post(`${server.gateway}/basics/route`);
    if (this.currentStep !== step) {
      this._currentStep = step;
      this._status = this._defaultStatus;
    }
    return step;
  }


  @action resetStepStatus = async (type) => {
    let result = await request.post(`${server.gateway}/basics/${type}/status/reset`);
    this._status = this._defaultStatus;
    return result;
  }

  @action fetchStepStatus = async (type, showLoading = true) => {
    let result = await request.post(`${server.gateway}/basics/${type}/status`, {}, {showLoading});
    this._status = merge({hasOperate: result.operate.length > 0}, result[type]);
    this._operate = result.operate;

    // this._status = {
      // hasOperate: true,
      // status: 1,
      // msg: '',
      // title: ''
    // };
    // setTimeout(() => {
      // this._status = {
        // hasOperate: false,
        // status: 1,
        // msg: '',
        // title: ''
      // }
    // }, 3000);
    // this._operate = [{
      // key: 'zj',
      // codeType: 'sms',
      // codeContent: 'https://www.baidu.com',
      // title: '短信验证码',
      // tip: '请输入运营商短信验证码'
    // }];
    return result;
  }

  @action fetchStepStatusPoll = async (type) => {
    this.statusPolling = true;

    let result = await request.post(`${server.gateway}/basics/${type}/status`, {}, {showLoading: false});
    // let result = {
      // OPERATOR: {
        // status: 1,
        // msg: '',
        // title: ''
      // },
      // operate: [],
    // };

    console.log('路由状态轮询:', result);
    this._status = merge({hasOperate: result.operate.length > 0}, result[type]);
    this._operate = result.operate;

    let shouldStop = false;
    let statusCode = result[type].status;
    let operate = result.operate;

    shouldStop = (statusCode !== 1 || operate.length > 0);
    if (!shouldStop) {
      setTimeout(() => this.fetchStepStatusPoll(type), 3000);
    }
    this.statusPolling = !shouldStop;
  }

  @action sendProfileSMSCodeRequest = async (key, code) => {
    let result = await request.post(`${server.gateway}/basics/verifyCode`, {key, code});
    return result;
  }

  async fetchJobInfoOptions () {
    let options = await request.post(
      `${server.gateway}/app/enums`,
      {enumTypes: 'COMPANY_INDUSTRY,COMPANY_POSITION,INCOME,EMPLOYMENT_TYPE,MARRIAGE_STATUS'}
    );
    return options;
  }

  async submitJobInfo (params) {
    let result = await request.post(
      `${server.gateway}/basics/add/extInfo`,
      {...params},
      {showLoading: false}
    );
    return result;
  }

  async submitContactInfo (contact) {
    let result = await request.post(
      `${server.gateway}/contacts/ice/add`,
      {ice: JSON.stringify([{name: contact.name, phone: contact.mobile, relation: 0}])},
      {showLoading: false},
    );
    return result;
  }

  async fetchZhimaCreditAuthURL (params) {
    let url = await request.post(
      `${server.gateway}/zmxy/auth`,
      {param: JSON.stringify(params)}
    );
    return url;
  }

  async orderApply (amount, frequency) {
    let result = await request.post(
      `${server.gateway}/order/apply`,
      {amount: amount, frequency: frequency}
    );
    return result;
  }

  async fetchCertificationInfoRequest () {
    return await request.post(`${server.gateway}/idcard/info`);
  }
}

export default ProfileStore;
