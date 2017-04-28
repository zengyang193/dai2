import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import assign from 'lodash/assign';
import shortId from 'shortid';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  List,
  ListItem,
  Input,
  Icon,
  Modal,
  Navigator,
} from 'react-onsenui';
import {
  STATUS_INITIALIZED,
  STATUS_PROCESSING,
  STATUS_PENDING,
  STATUS_FAILURE,
  STATUS_SUCCESS,
} from 'scripts/constants/importStatusEnum';
import BaseContainer from './BaseContainer';
import ListPage from 'scripts/components/profile/ImportOperatorPage';
import ProgressPage from 'scripts/components/profile/ImportOperatorProgress';
import server from 'scripts/config/server';
import { appendParamsToQueryString } from 'scripts/utils/url';
import bizLog from 'scripts/adapters/businessLog';
import { OPERATOR } from 'scripts/constants/profileSteps';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ImportOperatorNavigator extends BaseContainer {

  static defaultProps = {
    stepName: OPERATOR,
  }

  routes = [{
    id: shortId.generate(),
    title: '申请贷款(4/4)',
    componentFactory: React.createFactory(ListPage),
  }, {
    id: shortId.generate(),
    title: '运营商认证',
    componentFactory: React.createFactory(ProgressPage),
  }];

  currentPageId = '';
  navigator = null;

  componentWillMount () {
    this.fetchInitialData();

    window.onNativeLeftButtonClick = this.onNativeBackButtonClick;
    JSB.registerJSEventHandler('viewappear', this.componentDidAppear);
    JSB.callNative('NavBar.setLeftItem', {
      url: `${server.h5root}/images/back@2x.png`
    });
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    JSB.removeJSEventHandler('viewappear', this.componentDidAppear);
    window.onNativeLeftButtonClick = () => {
      JSB.callNative('Controller.pop', {});
    };
  }

  componentDidAppear = () => {
    const { pStore, stepName } = this.props;
    pStore.fetchStepStatus(stepName);
  }

  onNativeBackButtonClick = () => {
    bizLog.logWithStep('6004');
    setTimeout(() => {
      JSB.callNative('Controller.pop', {});
    }, 300);
  }

  async fetchInitialData () {
    const { pStore, stepName } = this.props;

    let step = await pStore.fetchCurrentStep();
    if (step === stepName) {
      pStore.fetchStepStatus(step);
      pStore.fetchStepConfiguration(step);
    }
  }

  onStatusChanged (status) {
    super.onStatusChanged(status);

    const { pStore, stepName } = this.props;
    let statusCode = status.status;
    let newState = {};

    switch (statusCode) {
      case -1:
      case 0:
        assign(newState, { importStatus: STATUS_INITIALIZED, statusTip: '' });
        break;
      case 1:
        let polling = pStore.statusPolling;
        if (status.hasOperate) { //无未完成的交互操作，开始轮询状态
          assign(newState, { importStatus: STATUS_PENDING, statusTip: '' });
        } else {
          assign(newState, { importStatus: STATUS_PROCESSING, statusTip: '' });
          if (!polling) {
            pStore.fetchStepStatusPoll(stepName);
          }
        }
        break;
      case 2:
        assign(newState, { importStatus: STATUS_SUCCESS, statusTip: '' });
        break;
      case 3:
      case 4:
        let { msg, title } = status;
        assign(newState, { importStatus: STATUS_FAILURE, statusTip: msg });
        setTimeout(() => pStore.resetStepStatus(stepName), 2000);
        break;
      case 5:
        assign(newState, { importStatus: STATUS_SUCCESS, statusTip: '' });
        setTimeout(() => pStore.fetchCurrentStep(), 2000);
        break;
    }

    if (newState.importStatus === STATUS_INITIALIZED) {
      if (this.currentPageId !== this.routes[0].id) {
        this.navigator.popPage();
      }
    } else {
      if (this.currentPageId !== this.routes[1].id) {
        this.navigator.pushPage(this.routes[1]);
      }
    }

    this.setState(newState);
  }

  onOperationReceived (op) {
    super.onOperationReceived(op);

    let newState = {};
    assign(newState, { importStatus: STATUS_PENDING });
    this.setState(newState);
  }

  renderPage = (route, navigator) => {
    const { importStatus, statusTip } = this.state;
    this.currentPageId = route.id;
    this.navigator = navigator;

    document.title = route.title;
    JSB.callNative('NavBar.setTitle', { title: route.title });

    return route.componentFactory({
      key: route.id,
      importStatus,
      statusTip,
      navigator,
    });
  }

  render () {
    const { pStore } = this.props;
    return (
      <Navigator renderPage={this.renderPage} initialRoute={this.routes[0]}/>
    );
  }
}

export default withRouter(ImportOperatorNavigator);
