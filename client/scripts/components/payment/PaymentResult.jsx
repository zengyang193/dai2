import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import {
  LOAN_ORDER_PREDICT_RESULT
} from 'scripts/constants/localStorageKeys';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  Button,
  AlertDialog
} from 'react-onsenui';
import { LOAN_ORDER_PAYMENT_INFO } from 'scripts/constants/localStorageKeys';
import server from 'scripts/config/server';
import bizLog from 'scripts/adapters/businessLog';
import SucResultPage from 'scripts/components/application/SucResultPage';
import ProgressCircular from 'scripts/components/ProgressCircular';
import JSB from 'scripts/adapters/jsbridge';
import 'styles/components/payment/PaymentResult.scss';
import ModalUtil from 'scripts/utils/modal';

class PrivilegeResult extends Component {

  render() {
    const {amount, actualAmount, frequency, bankName,paymentAmount, account, onChaneFrequency, handleSubmit} = this.props;

    return (
      <div className="payment-result-container">
        <div className="payment-success">
          <div className="check-liveness-status">
            <Icon icon='ion-ios-checkmark'/>
          </div>
          <div className="payment-result-txt">
            成功还款：<span className="payment-result-sum">￥{paymentAmount}</span>
          </div>
        </div>
        <div className="payment-privilege">
          <div className="payment-privilege-title">获得一次特权</div>
          <div className="payment-privilege-content">
            <div className="payment-privilege-first">
              恭喜您获得<span style={{marginLeft: '14px'}}>{amount}</span><label style={{marginRight: '14px'}}>元</label>贷款特权
            </div>
            <div className="payment-privilege-second">
              (实际到账<label>{actualAmount}元</label>)
            </div>
            <div className="payment-privilege-third">
              <div> 期限<label
                style={{marginLeft: '7px', marginRight: '7px'}}>{frequency}</label>天
              </div>
              <div className="payment-privilege-change-container" onClick={onChaneFrequency} style={{visibility: 'hidden'}}>
                <icon className="image-change"></icon>
                <span className="repayment-privilege-change">换个期限</span></div>
            </div>
            <div className="payment-privilege-third">
              <div> 将打款至<label
                style={{marginRight: '7px'}}>{bankName}</label>(<label>{account}</label>)
              </div>
            </div>
            <Button modifier="large" onClick={handleSubmit}
                    className="payment-privilege-get">领取贷款特权</Button>
          </div>
        </div>
      </div>
    )
  }
}

class RepeatLoanResult extends Component {

  render() {
    const {amount, actualAmount, frequency, bankName, account, paymentAmount, changeBorrowType, handleSubmit} = this.props;

    return (
      <div className="payment-result-container">
        <div className="payment-success">
          <div className="check-liveness-status">
            <Icon icon='ion-ios-checkmark'/>
          </div>
          <div className="payment-result-txt">
            成功还款：<span className="payment-result-sum">￥{paymentAmount}</span>
          </div>
        </div>
        <div className="payment-repeat">
          <span className="payment-repeat-txt">再借一笔？</span>
          <div className="payment-repeat-amount">
            {amount}元 <span className="payment-repeat-realAmount">(实际到账<label>{actualAmount}</label>元)</span>
          </div>
          <div className="payment-privilege-third">
            <div> 期限<label
              style={{marginLeft: '7px', marginRight: '7px'}}>{frequency}</label>天
            </div>
            <div className="payment-privilege-change-container" onClick={changeBorrowType} style={{visibility: 'hidden'}}>
              <icon className="image-change"></icon>
              <span className="repayment-privilege-change">换个借法</span></div>
          </div>
          <div className="payment-privilege-third">
            <div> 将打款至<label
              style={{marginRight: '7px'}}>{bankName}</label>(<label>{account}</label>)
            </div>
          </div>

          <Button modifier="large" onClick={handleSubmit}
                  className="payment-privilege-get">一键借款</Button>
        </div>

      </div>
    )
  }
}

class NormalResult extends Component {
  render() {

    const {amount, onNext} = this.props;

    let result = null;
    if (amount != 0) {
      result = (<div className="payment-result-txt">成功还款：<label>￥{amount}</label></div>);
    }
    return (
      <div className="page-import-progress">
        <div className="import-progress-container">
          <ProgressCircular value={100}/>
          <div className="progress-detail">
            <div className="progress-text">
              <Icon icon="ion-checkmark"></Icon>
            </div>
            <div className="progress-time">成功还款</div>
          </div>
          {result}

        </div>


        <Button modifier="large" onClick={onNext}
                className="payment-privilege-get" style={{width: '90%', margin: 'auto'}}>确定</Button>
      </div>
    )
  }
}

@inject('paymentStore') @observer
class PaymentResult extends Component {

  /**
   * {{privilege: string}} GOOD("表现优秀的用户"),FAIR("表现一般的用户"),POOR("风险用户");
   * @type {{privilege: string, paymentAmount: number, showRepeatDailog: boolean, showPrivilegeDailog: boolean}}
   */
  state = {
    privilege: null,
    paymentAmount: 0,
    showRepeatDailog: false,
    showPrivilegeDailog: false,
    applicationSucc: false
  };
  static defaultProps = {
    title: '还款结果',
  };

  componentWillMount () {
    this.fetchInitialData();
    bizLog.logWithStep('7006');

    window.onNativeLeftButtonClick = this.onBackButtonWithBizlogClick;
    JSB.callNative('NavBar.setLeftItem', {
      url: `${server.h5root}/images/back@2x.png`
    });
  }

  componentDidMount () {
    const {title} = this.props;
    document.title = title;
  }

  async fetchInitialData() {
    const {paymentStore} = this.props;
    try {
      ModalUtil.showPreloader();

      let privilege = await paymentStore.fetchPaymentResult();

      await paymentStore.fetchOrderInfo();

      await paymentStore.fetchProducts();

      // if (privilege == "GOOD") {
      //   await paymentStore.fetchPredict(1888, paymentStore.paymentResult.frequency);
      //   paymentStore.paymentResult.actualAmount = paymentStore.predict.realAmount;
      // }

      //TODO 只有1000 15这种借法
      await paymentStore.fetchPredict(1000, 15);


      ModalUtil.hidePreloader();

      //TODO  paymentStore.paymentResult 表示上次还款的结果
      //表示再借一笔实际到账额度
      paymentStore.paymentResult.actualAmount = paymentStore.predict.realAmount;
      //TODO 表示下次借款的期限 只有15天
      paymentStore.paymentResult.frequency = 15;
      //表示上次还款的额度
      this.setState({paymentAmount: paymentStore.paymentResult.amount});
      //TODO 表示再借一笔的额度 只有1000
      paymentStore.paymentResult.amount = 1000;

      this.setState({privilege: privilege});
    } catch (e) {
      ModalUtil.hidePreloader();
      this.setState({privilege: 'POOR'});
    }

  }

  async changeFrequency() {
    const {paymentStore} = this.props;

    bizLog.logWithStep('7010');

    if (paymentStore.products && paymentStore.products.frequencies.length > 1) {

      let frequencies = paymentStore.products.frequencies;

      var n = Math.floor(Math.random() * frequencies.length + 1) - 1;
      let tempFrequency = frequencies[n];

      if (tempFrequency === paymentStore.paymentResult.frequency) {
        n = Math.floor(Math.random() * frequencies.length + 1) - 1;
        tempFrequency = frequencies[n];
      }


      await paymentStore.fetchPredict(1888, tempFrequency);

      paymentStore.paymentResult.frequency = tempFrequency;
      paymentStore.paymentResult.actualAmount = paymentStore.predict.realAmount;
    }
  }

  async changeBorrowType() {
    const {paymentStore} = this.props;

    bizLog.logWithStep('7014');

    let amounts = paymentStore.products.amounts;
    let frequencies = paymentStore.products.frequencies;

    let tempAmount = paymentStore.paymentResult.amount;
    let tempFrequency = paymentStore.paymentResult.frequency;

    if (frequencies.length > 1) {
      var n = Math.floor(Math.random() * frequencies.length + 1) - 1;
      tempFrequency = frequencies[n];

    }
    if (amounts.length > 1) {
      var n = Math.floor(Math.random() * amounts.length + 1) - 1;
      tempAmount = amounts[n];
    }

    await paymentStore.fetchPredict(tempAmount, tempFrequency);

    paymentStore.paymentResult.amount = tempAmount;
    paymentStore.paymentResult.frequency = tempFrequency;
    paymentStore.paymentResult.actualAmount = paymentStore.predict.realAmount;
  }

  async handleSubmit() {
    const {paymentStore} = this.props;
    this.hideAlertDialog();

    let tempAmount = paymentStore.paymentResult.amount;
    if (this.state.privilege == "GOOD") {
      //TODO 没有1888
      // tempAmount = 1888;
      bizLog.logWithStep('7013');
    }else if(this.state.privilege == "FAIR"){
      bizLog.logWithStep('7017');
    }

    await paymentStore.orderApply(tempAmount, paymentStore.paymentResult.frequency, paymentStore.paymentResult.bankAccountId);

    bizLog.logWithStep('7001');

    localStorage.setItem(LOAN_ORDER_PREDICT_RESULT, JSON.stringify({
      amount: tempAmount,
      frequency: paymentStore.paymentResult.frequency,
      bankAccountId: paymentStore.paymentResult.bankAccountId
    }));

    if (__IS_APP__) {
      JSB.callNative('NavBar.setTitle', {title: '申请结果'});
    }

    this.setState({applicationSucc: true});


  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    if (__IS_APP__) {
      JSB.callNative('Controller.pop', {});
    } else {
      window.location.replace(redirectUrl);
    }
  }

  onBackButtonWithBizlogClick = () => {
    const redirectUrl = `${server.h5root}`;
    setTimeout(() => {
      if (__IS_APP__) {
        JSB.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }, 300);

    bizLog.logWithStep('7008');
  }

  onNormalBackButtonWithBizlogClick = () => {
    const redirectUrl = `${server.h5root}`;
    setTimeout(() => {
      if (__IS_APP__) {
        JSB.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }, 300);

    bizLog.logWithStep('7009');
  }


  showPrivilegeDailog = () => {
    bizLog.logWithStep('7011');
    this.setState({showPrivilegeDailog: true});
  }

  hideAlertDialog = () => {
    if (this.state.privilege == "GOOD") {
      bizLog.logWithStep('7012');
    }else if(this.state.privilege == "FAIR"){
      bizLog.logWithStep('7016');
    }
    this.setState({showPrivilegeDailog: false, showRepeatDailog: false});
  }

  showRepeatDailog = () => {
    bizLog.logWithStep('7015');
    this.setState({showRepeatDailog: true});
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClick={this.onBackButtonWithBizlogClick}>
            <Icon icon='ion-ios-arrow-left' />
          </ToolbarButton>
        </div>
        <div className="center">{this.props.title}</div>
      </Toolbar>
    );
  }

  render () {
    const {paymentStore} = this.props;

    let rootElement = null;

    if (this.state.applicationSucc) {
      rootElement = <SucResultPage
        next={this.onBackButtonClick.bind(this)}/>
    } else {
      switch (this.state.privilege) {
        case "GOOD":
          rootElement = (<PrivilegeResult
            paymentAmount={this.state.paymentAmount}
            amount={paymentStore.paymentResult.amount}
            bankName={paymentStore.paymentResult.bankName}
            actualAmount={paymentStore.paymentResult.actualAmount}
            frequency={paymentStore.paymentResult.frequency}
            account={paymentStore.paymentResult.account}
            onChaneFrequency={this.changeFrequency.bind(this)}
            handleSubmit={this.showPrivilegeDailog.bind(this)}
          />);
          break;
        case "FAIR":
          rootElement = (<RepeatLoanResult
            paymentAmount={this.state.paymentAmount}
            amount={paymentStore.paymentResult.amount}
            bankName={paymentStore.paymentResult.bankName}
            actualAmount={paymentStore.paymentResult.actualAmount}
            frequency={paymentStore.paymentResult.frequency}
            account={paymentStore.paymentResult.account}
            changeBorrowType={this.changeBorrowType.bind(this)}
            handleSubmit={this.showRepeatDailog.bind(this)}
          />);
          break;
        case "POOR":
          rootElement = (<NormalResult
            amount={this.state.paymentAmount}
            onNext={this.onNormalBackButtonWithBizlogClick.bind(this)}
          />);
          break;
      }
    }

    return (
      <Page
        className="page-payment-result"
        renderToolbar={this.renderToolbar}>
        {rootElement}
        <AlertDialog
          className="alert-dialog-wechat"
          isOpen={this.state.showRepeatDailog}
          isCancelable={false}>
          <div className='alert-dialog-title'>确定再借一笔？将为您产生一笔借款。</div>
          <div className='alert-dialog-footer alert-mfooter'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              再想想
            </button>
            <button onClick={this.handleSubmit.bind(this)} className='alert-dialog-button alert-dialog-right'>
              果断借了
            </button>
          </div>
        </AlertDialog>
        <AlertDialog
          className="alert-dialog-wechat"
          isOpen={this.state.showPrivilegeDailog}
          isCancelable={false}>
          <div className='alert-dialog-title'>确定要使用 ￥{paymentStore.paymentResult.amount} 特权吗？将为您产生一笔特权借款。</div>
          <div className='alert-dialog-footer alert-mfooter'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              放弃特权
            </button>
            <button onClick={this.handleSubmit.bind(this)} className='alert-dialog-button alert-dialog-right'>
              确定使用
            </button>
          </div>
        </AlertDialog>
      </Page>
    );
  }
}

export default withRouter(PaymentResult);


