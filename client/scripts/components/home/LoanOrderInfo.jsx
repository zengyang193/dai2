import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router';
import ons from 'onsenui';
import {
  Icon,
  Button,
} from 'react-onsenui';
import {
  LOAN_ORDER_PAYMENT_INFO
} from 'scripts/constants/localStorageKeys';
import ActionSheet from 'scripts/components/actionsheet';
import ProgressCircular from 'scripts/components/ProgressCircular';
import bizLog from 'scripts/adapters/businessLog';
import server from 'scripts/config/server';

@inject((stores) => ({
  homeStore: stores.homeStore
}))
@observer
class LoanOrderInfo extends Component {
  statusTextMap = {
    'reviewing': '审核中',
    'rejected': '被拒绝',
    'passed': '已通过',
    'lended': '已放款',
    'repayable': '待还款',
    'overdue': '已逾期',
  };

  statusIconMap = {
    'reviewing': 'ion-search',
    'rejected': 'ion-alert',
    'passed': 'ion-checkmark',
    'lended': 'ion-arrow-down-c',
    'repayable': 'ion-arrow-up-c',
    'overdue': 'ion-arrow-up-c',
  };

  agreementMenus = [{
    content: '居间服务协议',
    onClick: () => {
      this.showIntermediaryServiceAgreement();
    },
  }, {
    content: '委托代扣授权书',
    onClick: () => {
      this.showAuthorizationLetter();
    },
  }];

  state = {
    isAgreementSheetShow: false,
  };

  componentDidMount () {
    this.clearPaymentInfo();
  }

  async repaySchedule () {
    const { order, homeStore, location } = this.props;

    bizLog.logWithStep('7003');

    let callbackUrl = __IS_APP__
      ? `${server.h5root}/payment/success`
      : window.location.href;

    if (!order.canRepay) {
      let buttonLabels = '确定';

      if (!order.notified) {
        buttonLabels = ['确定', '设置可还款时提醒'];
      }

      let message = `您的贷款正在银行系统登记中，资金结算后可进行还款。${order.notified ? '我们将在可还款时，通过系统通知和短信告知您，感谢您支持开薪贷。' : '请稍后再试。'}`;
      let buttonIndex = await ons.notification.confirm({
        title: '',
        'class': 'repayment-notification-dialog',
        buttonLabels,
        message,
      });
      bizLog.logWithStep('7004');

      if (buttonIndex === 1) {
        bizLog.logWithStep('7005');

        await homeStore.logRepaymentReminder(order.orderId)
        ons.notification.alert({
          title: '设置成功',
          message: '我们将在可还款时，通过系统通知和短信告知您，感谢您支持开薪贷。',
          buttonLabels: '确定',
        });
        order.notified = 1;
        homeStore.updateLoanOrder(order);
      }
      return;
    }

    let selectBankName = order.repayBankName;
    let selectBankAccount = order.repayAccount;

    if (localStorage.getItem('selectBankInfo')) {
      let selectBankInfo = JSON.parse(localStorage.getItem('selectBankInfo'));
      selectBankName = selectBankInfo.bankName;
      selectBankAccount = selectBankInfo.bankAccount;
    }

    let buttonIndex = await ons.notification.alert({
      title: '',
      message: `确定使用${selectBankName}尾号${selectBankAccount}进行还款吗？`,
      buttonLabels: ['我要换卡', '确定使用'],
      cancelable: true
    });

    if (buttonIndex === 0) {
      localStorage.setItem('repayOrder',JSON.stringify(order));
      let searchStr = location.search;
      if (searchStr) {
        searchStr = searchStr + '&scenario=payment&loanStatus=' + order.loanStatus;
      } else {
        searchStr = '?scenario=payment&loanStatus=' + order.loanStatus;
      }

      let redirectUrl = `${server.h5root}/application/${order.originalId}/selectcard${searchStr}`;
      if (__IS_APP__) {
        JSBridge.callNative('Controller.push', {
          type: 'url',
          title: '选择银行卡',
          url: redirectUrl,
          showNavigationBar: true,
        });
      } else {
        window.location.href = redirectUrl;
      }

    } else {
      let repayInfo = await homeStore.fetchRepayType(order.repaymentScheduleId, callbackUrl);
      switch (repayInfo.type) {
        case 0:
          this.repayScheduleWithDelegation(order);
          break;
        case 1: //银联通道已不支持
          break;
        case 2:
          this.repayScheduleWithJDPay(repayInfo.payInfo, repayInfo.submitUrl);
          break;
        case 3:
          this.repayScheduleWithLianLianPay(repayInfo.payInfo, repayInfo.submitUrl);
          break;
        case -1:
          ons.notification.alert({
            title: repayInfo.title,
            message: repayInfo.tip,
            buttonLabels: '确认',
          })
          break;
      }
    }
  }

  async repayScheduleWithDelegation (order) {
    let { homeStore } = this.props;

    const fetchStatusPoll = async (serialNo) => {
      let data = await homeStore.fetchRepaymentStatusRequest(serialNo);
      let status = data.deductStatus;

      switch(status) {
        case 'TRAN_SUCCESS':
          await ons.notification.alert({
            title: '',
            message: '还款成功',
            buttonLabels: '确定',
          });
          bizLog.logWithStep('7006');
          break;
        case 'TRAN_UNKNOWN':
          ons.notification.alert({
            title: '',
            message: '扣款处理中，请稍后查询',
            buttonLabels: '确定',
          });
          break;
        case 'DEALING':
          if (this.state.shouldStopPoll) {
            this.setState({ shouldStopPoll: false });
          } else {
            setTimeout(() => fetchStatusPoll(serialNo), 3000);
          }
          break;
        case 'TRAN_FAIL':
          ons.notification.alert({
            title: '',
            message: '还款失败，请重试',
            buttonLabels: '确定',
          });
          break;
        default:
          ons.notification.alert({
            title: '',
            message: '还款失败，请重试',
            buttonLabels: '确定',
          });
      }
    };

    let buttonIndex = await ons.notification.confirm({
      title: '还款确认',
      message: `将从您尾号${order.repayAccount}的${order.repayBankName}账户扣款${order.periodAmount}元，是否确认还款？`,
      buttonLabels: ['取消', '确认'],
    });

    if (buttonIndex === 1) {
      let data = await homeStore.repayScheduleRequest(order.repaymentScheduleId)
      let serialNo = data.serialNo;
      fetchStatusPoll(serialNo);

      await ons.notification.alert({
        title: '',
        message: '正在还款...',
        buttonLabels: '确认',
      });
      this.setState({ shouldStopPoll: true });
    }
  }

  savePaymentInfo(payType, payInfo, payUrl) {
    localStorage.setItem(
      LOAN_ORDER_PAYMENT_INFO,
      JSON.stringify({payType, payInfo, payUrl}),
    );
  }

  clearPaymentInfo () {
    localStorage.removeItem(LOAN_ORDER_PAYMENT_INFO);
  }

  showIntermediaryServiceAgreement = () => {
    const { order } = this.props;
    let redirectUrl = `${server.h5root}/agreement/intermediate_service?loanOrderId=${order.orderId}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        url: redirectUrl,
        title: '居间服务协议',
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
    bizLog.logWithStep('7007');
  }

  showAuthorizationLetter = () => {
    const { order } = this.props;
    let redirectUrl = `${server.h5root}/agreement/authorization_letter?loanOrderId=${order.orderId}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        url: redirectUrl,
        title: '委托代扣授权书',
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
    bizLog.logWithStep('7007');
  }

  async repayScheduleWithJDPay (payInfo, payUrl) {
    this.savePaymentInfo('JingDong', payInfo, payUrl);

    let redirectUrl = `${server.h5root}/payment/jd`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '京东支付',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  async repayScheduleWithLianLianPay (payInfo, payUrl) {
    this.savePaymentInfo('LianLian', payInfo, payUrl);

    let redirectUrl = `${server.h5root}/payment/lianlian`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '连连支付',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  bindBankCard = () => {
    const { order } = this.props;
    let redirectUrl = `${server.h5root}/application/${order.originalId}/bindcard${location.search}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '绑定银行卡',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  selectBankCard = () => {
    const { order } = this.props;
    let redirectUrl = `${server.h5root}/application/${order.originalId}/selectcard${location.search}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '选择银行卡',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  showAgreementSheet = () => {
    this.setState({ isAgreementSheetShow: true });
  }

  hideAgreementSheet = () => {
    this.setState({ isAgreementSheetShow: false });
  }

  render () {
    const { order } = this.props;
    const { isAgreementSheetShow } = this.state;

    let dateStr = order.loanDate.replace(/\d{4}-(\d{2})-(\d{2})/, '$1月$2日');
    let statusTip = null;
    let actionButton = null;
    let agreement = null;

    switch (order.loanStatus) {
      case 'reviewing':
        if (order.hasBankCard) {
          statusTip = '请耐心等待哦~';
        } else {
          statusTip = '请绑定您的银行卡方便打款';
          actionButton = (
            <Button
              modifier="outline"
              onClick={order.hasBoundCard ? this.selectBankCard : this.bindBankCard}
              className="button-loan-action">
              绑定银行卡
            </Button>
          );
        }
        break;
      case 'rejected':
        statusTip = `可在${order.nextApplyTime}后重试`;
        break;
      case 'passed':
        statusTip = '将马上放款，请留意银行账户';
        break;
      case 'lended':
        statusTip = <strong>{order.remainDays}天到期</strong>;
        actionButton = (
          <Button
            modifier="large"
            onClick={this.repaySchedule.bind(this)}>
            我要还款（¥{order.repayableAmount}）
          </Button>
        );
        agreement = (
          <a
            className="button-agreement"
            onClick={this.showAgreementSheet}
            href="javascript:;">
            查看借款协议
          </a>
        );
        break;
      case 'repayable':
        statusTip = <strong>{order.remainDays}天到期</strong>;
        actionButton = (
          <Button
            modifier="large"
            onClick={this.repaySchedule.bind(this)}>
            我要还款（¥{order.repayableAmount}）
          </Button>
        );
        agreement = (
          <a
            className="button-agreement"
            onClick={this.showAgreementSheet}
            href="javascript:;">
            查看借款协议
          </a>
        );
        break;
      case 'overdue':
        statusTip = <strong>已逾期{order.remainDays}天</strong>;
        actionButton = (
          <Button
            modifier="large"
            onClick={this.repaySchedule.bind(this)}>
            我要还款（¥{order.repayableAmount}）
          </Button>
        );
        agreement = (
          <a
            className="button-agreement"
            onClick={this.showAgreementSheet}
            href="javascript:;">
            查看借款协议
          </a>
        );
        break;
    }
    return (
      <div className={`loan-order-info  ${order.loanStatus}`}>
        <div className="loan-order-detail">
          {dateStr}<strong>{order.loanTime}</strong>
          申请<strong>¥{order.loanAmount}</strong>提现
          {order.bankName && `到${order.bankName}`}
          {order.bankAccount && <strong>{order.bankAccount}</strong>}
        </div>
        <div className="loan-order-status">
          <ProgressCircular modifier="determinate" className="order-progress-circular" value={80} />
          <div className="status-icon-wrapper">
            <Icon icon={this.statusIconMap[order.loanStatus]} className="status-icon" />
            <div className="status-text">{this.statusTextMap[order.loanStatus]}</div>
          </div>
        </div>
        <div className="loan-order-tip">{statusTip}</div>
        <div className="loan-order-action">{actionButton}</div>
        <div className="loan-order-agreement">{agreement}</div>
        <ActionSheet
          show={isAgreementSheetShow}
          menus={this.agreementMenus}
          onCancel={this.hideAgreementSheet}/>
      </div>
    );
  }
}

export default withRouter(LoanOrderInfo);
