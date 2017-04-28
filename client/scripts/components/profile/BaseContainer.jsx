import React, { Component } from 'react';
import { reaction, toJS } from 'mobx';
import assign from 'lodash/assign';
import ons from 'onsenui';
import {
  STATUS_INITIALIZED,
  STATUS_PROCESSING,
  STATUS_PENDING,
  STATUS_FAILURE,
  STATUS_SUCCESS,
} from 'scripts/constants/importStatusEnum';
import stepRouterMap from 'scripts/constants/stepRouterMap';

class BaseContainer extends Component {

  state = {
    importStatus: STATUS_INITIALIZED,
    statusTip: '',
  };

  statusReactionDisposer = reaction(
    () => {
      const { pStore } = this.props;
      return pStore.status;
    },
    (status) => {
      this.onStatusChanged(status);
    }
  );

  stepReactionDisposer = reaction(
    () => {
      const { pStore } = this.props;
      return pStore.currentStep;
    },
    (step) => {
      this.onStepChanged(step);
    }
  );

  operateReactionDisposer = reaction(
    () => {
      const { pStore } = this.props;
      return pStore.operate;
    },
    (operate) => {
      if (operate.length > 0) {
        this.onOperationReceived(operate);
      }
    }
  );

  componentWillUnmount () {
    this.dispose();
  }

  dispose () {
    this.statusReactionDisposer();
    this.stepReactionDisposer();
    this.operateReactionDisposer();
  }

  onStepChanged (step) {
    const { history } = this.props;
    let pathname = stepRouterMap[step];
    history.replace({ pathname: pathname, search: location.search });
  }

  onStatusChanged (status) {
    const { pStore } = this.props;
    console.log(`${pStore.currentStep}路由状态变更`, toJS(status));
  }

  onOperationReceived (operate = []) {
    const { pStore } = this.props;
    operate.forEach((op) => this.handleOperation(op, pStore.currentStep));
  }

  //处理用户交互操作
  handleOperation (op, type) {
    switch(op.codeType) {
      case 'sms': //短信验证码
        this.showSMSCodeModal(op, type);
        break;
      case 'website': //跳转到指定网页进行相关操作
        this.showWebsiteView(op, type);
        break;
      case 'image': //图片验证码
        this.showImageCaptchaModal(op, type);
        break;
    }
  }

  async showImageCaptchaModal (op, type) {
    let { pStore } = this.props;
    let innerText =
      `<div class="captcha-container">
        <div class="captcha-tip">${op.tip}</div>
        <img class="captcha-image" src="data:image/png;base64,${op.codeContent}" />
      </div>`;

    let code = await ons.notification.prompt({
      title: op.title,
      messageHTML: innerText,
      buttonLabels: '确定',
      placeholder: '请输入验证码',
    });

    if (!code) {
      this.handleOperation(op, type);
      return;
    }

    await pStore.sendProfileSMSCodeRequest(op.key, code);
    await pStore.fetchStepStatusPoll(type);
  }

  async showSMSCodeModal (op, type) {
    let { pStore } = this.props;
    let code = await ons.notification.prompt({
      title:  op.title,
      message: op.tip,
      buttonLabels: '确定',
      placeholder: '请输入短信验证码',
    });

    if (!code) {
      this.handleOperation(op, type);
      return;
    }

    await pStore.sendProfileSMSCodeRequest(op.key, code)
    await pStore.fetchStepStatusPoll(type);
  }

  async showWebsiteView (op, type) {
    let searchStr = window.location.search;
    if (searchStr) {
      searchStr += `key=${op.key}`;
    } else {
      searchStr = `?key=${op.key}`;
    }
    let redirectUrl = `${op.codeContent}${searchStr}`;
    await ons.notification.confirm({
      title:  op.title,
      message: op.tip,
      buttonLabels: '确定'
    });

    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: op.title,
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }
}

export default BaseContainer;
