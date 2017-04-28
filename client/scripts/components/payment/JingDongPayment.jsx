import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import each from 'lodash/each';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
} from 'react-onsenui';
import { LOAN_ORDER_PAYMENT_INFO } from 'scripts/constants/localStorageKeys';
import ProgressCircular from 'scripts/components/ProgressCircular';
import server from 'scripts/config/server';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.paymentStore,
}))
@observer
class JingDongPayment extends Component {

  static defaultProps = {
    title: '京东支付',
  };

  constructor (props) {
    super(props);

    const payment = JSON.parse(localStorage.getItem(LOAN_ORDER_PAYMENT_INFO));
    this.state = { payment, };
  }

  componentDidMount () {
    const { payment } = this.state;
    if (payment && payment.payUrl) {
      if (__PLATFORM__ === 'ios') {
        // ios参数处理错误，不显示NavigationBar时showNavigationBar为true
        JSB.callNative('Navbar.setBarShow', { showNavigationBar: true });
      }
      setTimeout(() => this.refs.paymentForm.submit());
    }
  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
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

  render () {
    const { pStore } = this.props;
    const { payment } = this.state;
    let payInfoInputs = [];
    if (payment) {
      each(payment.payInfo, (val, key) => {
        payInfoInputs.push(
          <input key={`pay-info-${key}`} type="hidden" name={key} value={val} />
        );
      });
    }

    return (
      <Page
        className="page-payment"
        renderToolbar={this.renderToolbar}>
        <div className="payment-loading-container">
          <ProgressCircular indeterminate />
          <div className="payment-status-text">正在前往京东支付</div>
          {payment &&
            <form
              method="POST"
              ref="paymentForm"
              action={payment.payUrl}
              noValidate="noValidate">
              {payInfoInputs}
            </form>
          }
        </div>
      </Page>
    );
  }
}

export default withRouter(JingDongPayment);

