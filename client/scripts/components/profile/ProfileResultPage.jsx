import 'styles/components/profile/ProfileResultPage.scss';

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  Icon,
} from 'react-onsenui';
import BaseContainer from './BaseContainer';
import server from 'scripts/config/server';
import { appendParamsToQueryString } from 'scripts/utils/url';
import bizLog from 'scripts/adapters/businessLog';
import ProgressCircular from 'scripts/components/ProgressCircular';
import { LOAN_ORDER_PREDICT_RESULT } from 'scripts/constants/localStorageKeys';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ProfileResultPage extends BaseContainer {

  static defaultProps = {
    title: '资料认证',
  };

  state = {
    progress: 0,
    statusText: '现在马上去设置你的提现银行卡吧~',
    detailText: null,
    statusTip: null,
  };

  componentWillMount () {
    const { pStore, title } = this.props;
    pStore.fetchCurrentStep();

    document.title = title;
    JSB.callNative('NavBar.setTitle', { title });
  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    if (__IS_APP__) {
      JSB.callNative('Controller.pop', {});
    } else {
      window.location.replace(redirectUrl);
    }
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
      </Toolbar>
    );
  }

  async bindCard () {
    const {pStore, location} = this.props;

    bizLog.logWithStep('7002');

    let predictResult = JSON.parse(localStorage.getItem(LOAN_ORDER_PREDICT_RESULT));
    let result = await pStore.orderApply(predictResult.amount, predictResult.frequency);

    bizLog.logWithStep('7001');

    let redirectUrl = '';

    let searchStr = location.search;
    if (searchStr) {
      searchStr += '&scenario=application';
    } else {
      searchStr = '?scenario=application';
    }

    if (result.isBindBankCard) {
      redirectUrl = `${server.h5root}/application/${result.orderId}/selectcard${searchStr}`;
    } else {
      redirectUrl = `${server.h5root}/application/${result.orderId}/bindcard${searchStr}`;
    }
    window.location.href = redirectUrl;

  }

  render () {
    const { pStore, importStatus } = this.props;
    const {
      progress,
      statusText,
      statusTip,
      detailText,
    } = this.state;

    return (
      <Page
        className="page-profile page-profile-result page-import-progress"
        renderToolbar={this.renderToolbar}>
        <div className="import-progress-container">
          <ProgressCircular value={100} />
          <div className="progress-detail">
            <div className="progress-text">
              <Icon icon="ion-checkmark"></Icon>
            </div>
            <div className="progress-time">认证成功</div>
          </div>
        </div>
        <div className="status-text">{statusText}</div>

        <div className="action-container">
          <Button modifier="large" onClick={this.bindCard.bind(this)}>确认借款并设置银行卡</Button>
        </div>
      </Page>
    );
  }
}

export default withRouter(ProfileResultPage);
