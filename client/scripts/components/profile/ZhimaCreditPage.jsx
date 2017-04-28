import 'styles/components/profile/ZhimaCreditPage.scss';

import React, {Component} from 'react';
import { observer, inject } from 'mobx-react';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  List,
  ListItem,
  Button,
  Icon,
} from 'react-onsenui';
import BaseContainer from './BaseContainer';
import UserUtil from 'scripts/utils/user';
import ModalUtil from 'scripts/utils/modal';
import server from 'scripts/config/server';
import bizLog from 'scripts/adapters/businessLog';
import { ZMXY } from 'scripts/constants/profileSteps';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ZhimaCreditPage extends BaseContainer {
  static defaultProps = {
    title: '申请贷款(3/4)',
    stepName: ZMXY,
  };

  statusDetectTimer = null;

  componentWillMount () {
    this.fetchInitialData();

    const { title } = this.props;
    document.title = title;

    JSB.registerJSEventHandler('viewappear', this.componentDidAppear);
    JSB.callNative('NavBar.setTitle', { title });

    window.onNativeLeftButtonClick = this.onBackButtonClick;
    JSB.callNative('NavBar.setLeftItem', {
      url: `${server.h5root}/images/back@2x.png`
    });
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    this.stopStatusDetection();

    JSB.removeJSEventHandler('viewappear', this.componentDidAppear);
    window.onNativeLeftButtonClick = () => {
      JSB.callNative('Controller.pop', {});
    };
  }

  componentDidAppear = () => {
    ModalUtil.showPreloader();
    this.startStatusDetection();
  }

  startStatusDetection () {
    if (this.statusDetectTimer) { return; }

    const { pStore } = this.props;
    const fetchStatusHandler = async () => {
      let data = await pStore.fetchStepStatus(ZMXY);
      let status = data[ZMXY];
      let statusCode = status.status;
      if (statusCode === 1) {
        ModalUtil.showPreloader();
        this.statusDetectTimer = setTimeout(fetchStatusHandler, 3000);
        return;
      } else {
        ModalUtil.hidePreloader();
        this.stopStatusDetection();
      }

      switch (statusCode) {
        case 3:
        case 4:
          ons.notification.alert({
            title: status.title,
            message: status.msg,
            buttonLabels: '确定',
          })
          break;
        case 5:
          ModalUtil.toast('芝麻信用授权成功');
          pStore.fetchCurrentStep();
          break;
      }
    };

    fetchStatusHandler();
  }

  stopStatusDetection () {
    clearTimeout(this.statusDetectTimer);
    this.statusDetectTimer = null;
  }

  async fetchInitialData () {
    const { pStore, stepName } = this.props;
    let step = await pStore.fetchCurrentStep();
    if (step === stepName) {
      pStore.fetchStepStatus(ZMXY);
    }
  }

  showFAQ () {
    let { location } = this.props;
    let redirectUrl = `${server.h5root}/faq${location.search}`;
    if (__IS_APP__) {
      JSB.callNative('Controller.push', {
        type: 'url',
        url: redirectUrl,
        title: '常见问题',
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  async authorizeZhimaCredit () {
    const { pStore } = this.props;
    const auth = UserUtil.fetchAuthorization();
    let {url} = await pStore.fetchZhimaCreditAuthURL({
      userId: auth.userId,
      token: auth.token,
      redirectUrl: `${server.h5root}/profile/zmxy/result`
    });
    setTimeout(() => {
      if (__IS_APP__) {
          JSB.callNative('Controller.push', {
            type: 'url',
            title: '芝麻信用授权',
            url: url,
            showNavigationBar: true,
          });
      } else {
        window.location.href = url;
      }
    }, 300);
    bizLog.logWithStep('5001');
  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    setTimeout(() => {
      if (__IS_APP__) {
        JSB.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }, 300);
    bizLog.logWithStep('5002');
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClick={this.onBackButtonClick}>
            <Icon icon='ion-ios-arrow-left' />
          </ToolbarButton>
        </div>
        <div className="center">{this.props.title}</div>
        <div className="right">
          <ToolbarButton onClick={this.showFAQ}>
            <Icon icon='ion-ios-help-outline' />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render () {
    return (
      <Page className="page-profile page-zhima-credit" renderToolbar={this.renderToolbar}>
        <div className="profile-title">验证个人信用信息</div>
        <div className="content-block logo-block">
          服务由<span className="zhima-credit-logo"/>提供
        </div>
        <div className="action-container">
          <Button modifier="large" onClick={this.authorizeZhimaCredit.bind(this)}>开始验证</Button>
        </div>
      </Page>
    );
  }
}

export default ZhimaCreditPage;

