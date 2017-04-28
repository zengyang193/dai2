import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
import classNames from 'classnames';
import _ from 'lodash';
import 'styles/components/application/BindBankCardPage.scss';
import SucResultPage from 'scripts/components/application/SucResultPage';
import bizLog from 'scripts/adapters/businessLog';
import queryString from 'query-string';
import server from 'scripts/config/server';
import ons from 'onsenui';

import {isMobile} from 'scripts/utils/validation';
import ModalUtil from 'scripts/utils/modal';
import JSB from 'scripts/adapters/jsbridge';
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
  ListHeader,
  AlertDialog
} from 'react-onsenui';

@inject('applicationStore') @observer
class BindBankCardPage extends Component {

  constructor(props) {
    super(props);

    const {location} = props;
    this.query = queryString.parse(location.search);

    this.state = {
      loanStatus:this.query.loanStatus || null,
      showPhoneStatus: 0,
      phoneErrorMsg: "",
      index: 0,
      smsTimeout: 0,
      bankCardErrorMsg: "",
      alertDialogShown: false,
      cardNotSame: false,
      bindcardSuc: false,
      scenario: this.query.scenario || 'changecard',
    };
  }


  static defaultProps = {
    title: '添加银行卡'
  }

  componentWillMount() {
    const {applicationStore, match: { params }} = this.props;

    if (params.originalId) {
      applicationStore.oriOrderId = params.originalId;
    }

    applicationStore.fetchIdCardInfo();

    const { title } = this.props;
    document.title = title;
    JSB.callNative('NavBar.setTitle', { title });
  }

  componentWillUnmount() {
    clearInterval(this.smsInterval);

  }

  onBackButtonClick = () => {
    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
    } else {
      window.history.back();
    }
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left" onClick={this.onBackButtonClick}>
          <ToolbarButton>
            <Icon icon='ion-ios-arrow-left'/>
          </ToolbarButton>
        </div>
        <div className="center">{this.props.title}</div>
      </Toolbar>
    );
  }

  handleBankCardChange = (e) => {
    let {applicationStore} = this.props;

    let cardNo = e.target.value;

    applicationStore.tempBankCardInfo.bankCardNo = cardNo;

    if (cardNo && cardNo.length >= 16) {
      applicationStore.fetchCardCategory(cardNo)
    }
  }

  handleMobileChange = (e) => {
    let {applicationStore} = this.props;

    let cardNo = e.target.value;

    applicationStore.tempBankCardInfo.mobile = cardNo;

    if (isMobile(cardNo)) {
      this.setState({showPhoneStatus: 1});
      this.setState({phoneErrorMsg: null});
    } else {
      this.setState({showPhoneStatus: 2});
      this.setState({phoneErrorMsg: '请输入正确手机号码'});
    }
  }

  handleCodeChange = (e) => {
    let {applicationStore} = this.props;
    applicationStore.tempBankCardInfo.code = e.target.value;
  }

  async handleSubmit() {
    const {applicationStore, history, location, match: { params }} = this.props;

    if (!applicationStore.cardCategory.isSupport) {
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }
    if (!applicationStore.selectBankCard) {
      ModalUtil.toast("请选择发卡行");
      return;
    }
    if (!applicationStore.tempBankCardInfo.bankCardNo) {
      ModalUtil.toast("请输入银行卡号");
      return;
    }
    if (!applicationStore.cardCategory.bankId) {
      applicationStore.cardCategory.isSupport = false;
      applicationStore.cardCategory.message = "输入正确的银行卡号";
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }

    if (applicationStore.cardCategory.bankId != applicationStore.selectBankCard.id) {
      applicationStore.cardCategory.isSupport = false;
      applicationStore.cardCategory.message = "银行卡号和发卡行不一致";
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }
    if (!applicationStore.tempBankCardInfo.mobile || !isMobile(applicationStore.tempBankCardInfo.mobile)) {
      ModalUtil.toast("输入正确的手机号");
      return;
    }

    if (!applicationStore.orderNo) {
      ModalUtil.toast("请先发送验证码");
      return;
    }

    bizLog.logWithStep('8004');

    await applicationStore.bindCardAction(applicationStore.tempBankCardInfo.mobile, applicationStore.selectBankCard.id, applicationStore.tempBankCardInfo.bankCardNo, this.state.loanStatus ? 0 : applicationStore.oriOrderId, applicationStore.tempBankCardInfo.code, applicationStore.orderNo);

    switch (this.state.scenario) {
      case 'application':
        ModalUtil.toast('银行卡绑定成功');
        setTimeout(() => {
          this.setState({bindcardSuc: true});
        }, 500);
        break;

      case 'changecard':
        ModalUtil.toast('银行卡绑定成功');
        let redirectUrl = `${server.h5root}?${location.search}`;
        if (__IS_APP__) {
          JSBridge.callNative('Controller.pop', {});
        } else {
          window.location.replace(redirectUrl);
        }
        break;
      case 'payment':

        ModalUtil.toast('银行卡绑定成功');

        let redirectUrl2 = `${server.h5root}/application/${applicationStore.oriOrderId}/selectcard${location.search}`;
        window.location.replace(redirectUrl2);

        break;
    }

  }

  sendSMS = () => {
    const {applicationStore} = this.props;

    if (!applicationStore.cardCategory.isSupport) {
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }
    if (!applicationStore.selectBankCard) {
      ModalUtil.toast("请选择发卡行");
      return;
    }
    if (!applicationStore.tempBankCardInfo.bankCardNo) {
      ModalUtil.toast("请输入银行卡号");
      return;
    }
    if (!applicationStore.cardCategory.bankId) {
      applicationStore.cardCategory.isSupport = false;
      applicationStore.cardCategory.message = "输入正确的银行卡号";
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }
    if (applicationStore.cardCategory.bankId != applicationStore.selectBankCard.id) {
      applicationStore.cardCategory.isSupport = false;
      applicationStore.cardCategory.message = "银行卡号和发卡行不一致";
      ModalUtil.toast(applicationStore.cardCategory.message);
      return;
    }
    if (!applicationStore.tempBankCardInfo.mobile || !isMobile(applicationStore.tempBankCardInfo.mobile)) {
      ModalUtil.toast("输入正确的手机号");
      return;
    }


    let mobile = applicationStore.tempBankCardInfo.mobile;
    let smsTimeout = this.state.smsTimeout;
    if (mobile && !smsTimeout) {
      this.setState({smsTimeout: 60, sendCodeDisabled: true});
      this.smsInterval = setInterval(() => {
        let nextTick = this.state.smsTimeout - 1;
        this.setState({smsTimeout: nextTick});
        if (nextTick === 0) {
          clearInterval(this.smsInterval);
          this.setState({sendCodeDisabled: false});
        }
      }, 1000);

      bizLog.logWithStep('8001');
      if (applicationStore.orderNo) {
        applicationStore.reSendSMSCode(applicationStore.tempBankCardInfo.mobile, applicationStore.orderNo);
      } else {
        applicationStore.sendSMSCode(applicationStore.tempBankCardInfo.mobile, applicationStore.tempBankCardInfo.bankCardNo, applicationStore.selectBankCard.id);
      }
    }

  }

  selectBankCard = () => {
    let {history, location, applicationStore} = this.props;
    history.push({pathname: '/application/cardlist', search: location.search});
  }

  goNext = () => {
    const {location} = this.props;
    let redirectUrl = `${server.h5root}?${location.search}`;

    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
    } else {
      window.location.replace(redirectUrl);
    }
  }


  showHelp = () => {
    this.setState({alertDialogShown: true});
  }
  hideAlertDialog = () => {
    this.setState({alertDialogShown: false});
  }

  render() {
    const {applicationStore} = this.props;
    let idcardClass = classNames({
      'bind-card-idcard-display': !applicationStore.idcardInfo
    });

    let sendSMSClass = classNames({
      "bind-card-sendsms": true,
      "send-disable": this.state.sendCodeDisabled,
    });

    let smsTimeout = this.state.smsTimeout;
    let smsButtonText = smsTimeout ? `${smsTimeout}S后重发` : '发送验证码';

    if (applicationStore.selectBankCard && applicationStore.cardCategory.bankId && applicationStore.cardCategory.bankId != applicationStore.selectBankCard.id) {
      applicationStore.cardCategory.isSupport = false;
      applicationStore.cardCategory.message = "银行卡号和发卡行不一致";
      this.setState({cardNotSame: true});
    } else {
      if (this.state.cardNotSame) {
        applicationStore.cardCategory.isSupport = true;
      }
    }


    let rootElement = ( <div className="page-container">
      <AlertDialog
        isOpen={this.state.alertDialogShown}
        isCancelable={false}>
        <div className='alert-dialog-title alert-dialog-title-center'>为了方便提现，所绑银行卡需要开通在线支付功能。若无请联系银行客服，或者到中国银联开通。</div>
        <div className='alert-dialog-footer alert-mfooter'>
          <button onClick={this.hideAlertDialog} className='alert-dialog-button alert-dialog-right'>
            确定
          </button>
        </div>
      </AlertDialog>

      <List>
        <ListItem className={idcardClass}>
          <div className="left bind-card-idcard-name">
            {applicationStore.idcardInfo ? applicationStore.idcardInfo.name : ""}
          </div>
          <div className="center bind-card-idcard-no">
            <label className="idcard-img"></label>
            {applicationStore.idcardInfo ? applicationStore.idcardInfo.idNumber : ""}
          </div>
        </ListItem>
        <ListItem modifier="longdivider tappable chevron">
          <div className="left bind-card-txt">
            发卡银行
          </div>
          <div className="center" onClick={this.selectBankCard}>

            {!applicationStore.selectBankCard ? "" :
              <div className="bankcardimg"><Icon
                className={`ico-bank-lg bk-logo-${applicationStore.selectBankCard.id}`}/></div>}

            {!applicationStore.selectBankCard ? "请选择银行" : applicationStore.selectBankCard.bankName}
          </div>
        </ListItem>

        <ListItem modifier="longdivider">
          <div className="left bind-card-txt">
            银行卡号
          </div>
          <div className="center">
            <Input placeholder="请输入银行卡号" className="bind-card-input" onChange={this.handleBankCardChange}
                   value={applicationStore.tempBankCardInfo.bankCardNo}/>
          </div>
          <div className="right" style={{display: applicationStore.showCardErrorMsg ? 'block' : 'none'}}>
            <div className={applicationStore.cardCategory.isSupport ? "valid-suc" : "valid-error"}></div>
          </div>
        </ListItem>
        <div className="validate-error-tip"
             style={{display: !applicationStore.cardCategory.isSupport ? 'block' : 'none'}}>{applicationStore.cardCategory.message}</div>

        <ListItem modifier="longdivider">
          <div className="left bind-card-txt">
            手机号
          </div>
          <div className="center">
            <Input placeholder="请输入银行预留手机" className="bind-card-input" type="number" maxLength="11"
                   value={applicationStore.tempBankCardInfo.mobile}
                   onChange={this.handleMobileChange}/>
          </div>
          <div className="right" style={{display: this.state.showPhoneStatus != 0 ? 'block' : 'none'}}>
            <div className={this.state.showPhoneStatus == 1 ? "valid-suc" : "valid-error"}></div>
          </div>
        </ListItem>
        <div className="validate-error-tip"
             style={{display: this.state.phoneErrorMsg ? 'block' : 'none'}}>{this.state.phoneErrorMsg}</div>

        <ListItem modifier="longdivider">
          <div className="left bind-card-txt">
            验证码
          </div>
          <div className="center">
            <Input placeholder="请输入短信验证码" className="bind-card-input" type="number" onChange={this.handleCodeChange}
                   value={applicationStore.tempBankCardInfo.code}/>
          </div>
          <div className="right">
            <Button modifier='quiet' className={sendSMSClass} onClick={this.sendSMS}>{smsButtonText}</Button>
          </div>
        </ListItem>
      </List>
      <p className="bind-card-tip">所绑银行卡需要开通在线支付功能<Icon icon='ion-ios-help-outline'
                                                        style={{marginLeft: '5px', verticalAlign: '-6%'}}
                                                        onClick={this.showHelp}/></p>
      <Button modifier="large" onClick={this.handleSubmit.bind(this)} className="bind-card-submit">提交</Button>
    </div>);


    if (this.state.bindcardSuc && this.state.scenario == 'application') {
      rootElement = <SucResultPage
        next={this.goNext.bind(this)}/>
    }

    return (
      <Page className="page-application page-bind-bankcard" renderToolbar={this.renderToolbar}>


        {rootElement}

      </Page>
    );
  }
}

export default withRouter(BindBankCardPage);


