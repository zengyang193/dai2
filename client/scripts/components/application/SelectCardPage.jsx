import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
import _ from 'lodash';
import 'styles/components/application/SelectCardPage.scss';
import server from 'scripts/config/server';
import SucResultPage from 'scripts/components/application/SucResultPage';
import bizLog from 'scripts/adapters/businessLog';
import ModalUtil from 'scripts/utils/modal';
import queryString from 'query-string';
import JSB from 'scripts/adapters/jsbridge';
import ons from 'onsenui';
import {
  LOAN_ORDER_PAYMENT_INFO
} from 'scripts/constants/localStorageKeys';

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
  ListHeader
} from 'react-onsenui';

class BankCardItem extends Component {


  render() {
    let {card, selected, changeBankCard} = this.props;
    let cardNo = card.cardNo;
    let cardSuffix = cardNo.substring(cardNo.length - 4);
    return (
      <li className={ selected ? 'card-selected' : ''} onClick={_.partial(changeBankCard, card)}>
        <div className="bank-info">
          <div className="bank-icon-container">
            <i className={`ico-bank-lg bk-logo-${card.bankId}`}></i>
          </div>
          <div>{card.bankName}</div>
        </div>
        <div className="card-no">
          <span>****</span>
          <span>****</span>
          <span>****</span>
          <span>{cardSuffix}</span>
        </div>
      </li>
    );
  }
}

class BankCardList extends Component {
  render() {
    let {list, bindNewBankCard, changeBankCard, selectedCardId, type} = this.props;
    let cardElements = list.map(function (item, idx) {
      let isSelected = false;
      if (selectedCardId) {
        isSelected = item.cardId === selectedCardId;
      } else {
          isSelected = item.isCurrentCard;
      }
      return (
        <BankCardItem
          card={item}
          selected={isSelected}
          changeBankCard={changeBankCard}
          key={`bankcard-item-${idx}`}
        >

        </BankCardItem>
      );
    });
    return (
      <div className="content-block card-list-block">
        <ul>
          {cardElements}
          <li className="action">
            <a className="button-add-card" onClick={bindNewBankCard} href="javascript:;">
              <span className="plus">+</span>
              <span>添加银行卡(储蓄卡)</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

@inject((stores) => ({
  homeStore: stores.homeStore,
  applicationStore: stores.applicationStore
}))
@observer
class SelectCardPage extends Component {

  constructor(props) {
    super(props);

    const {location} = props;
    this.query = queryString.parse(location.search);

    this.state = {
      setDefaultCard: false,
      scenario: this.query.scenario || 'changecard',
    };
  }

  static defaultProps = {
    title: '选择银行卡'
  }

  componentWillMount() {
    const {applicationStore, match: {params}} = this.props;
    applicationStore.oriOrderId = params.originalId;
    applicationStore.fetchBoundlist(params.originalId);

    const { title } = this.props;
    document.title = title;
    JSB.callNative('NavBar.setTitle', { title });

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


  bindNewBankCard = () => {
    bizLog.logWithStep('8003');
    let {history, location, applicationStore} = this.props;

    //清空之前的数据
    applicationStore.bindCardSuc = false;
    applicationStore.tempBankCardInfo = {
      code: null,
      mobile: null,
      bankCardNo: null,
    };
    applicationStore.showCardErrorMsg = false;
    applicationStore.selectBankCard = null;
    applicationStore.orderNo = null;

    history.push({
      pathname: `/application/${applicationStore.oriOrderId}/bindcard`,
      search: location.search
    });
  }

  async changeBankCard(card) {
    if (!card.available) {
      ModalUtil.toast(card.memo);
      return;
    }

    bizLog.logWithStep('8002');
    const {applicationStore, match: {params}, homeStore} = this.props;

    if (!card.isSelected) {
      let cardId = card.cardId;
      this.setState({selectedCardId: cardId})
    }

    switch (this.state.scenario) {
      case 'application':

        await applicationStore.changeBankCard(params.originalId, card.cardId);

        this.setState({setDefaultCard: true});
        break;
      case 'changecard':

        await applicationStore.changeBankCard(params.originalId, card.cardId);

        ModalUtil.toast('更换银行卡成功');
        if (__IS_APP__) {
          JSBridge.callNative('Controller.pop', {});
        } else {
          window.history.back();
        }
        break;
      case 'payment':
        let order = JSON.parse(localStorage.getItem('repayOrder'));

        await applicationStore.changeRepayBankCard(order.orderId, card.cardId);

        let bankAccount = card.cardNo.substring(card.cardNo.length - 4);

        localStorage.setItem('selectBankInfo', JSON.stringify({bankName: card.bankName, bankAccount: bankAccount}));

        let callbackUrl = __IS_APP__
          ? `${server.h5root}/payment/success`
          : window.location.href;

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
        break;
    }
  }

  async repayScheduleWithDelegation(order) {
    let {homeStore} = this.props;

    const fetchStatusPoll = async(serialNo) => {
      let data = await homeStore.fetchRepaymentStatusRequest(serialNo);
      let status = data.deductStatus;

      switch (status) {
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
            this.setState({shouldStopPoll: false});
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
      message: `将从您尾号${order.bankAccount}的${order.bankName}账户扣款${order.periodAmount}元，是否确认还款？`,
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
      this.setState({shouldStopPoll: true});
    }
  }

  async repayScheduleWithJDPay(payInfo, payUrl) {
    this.savePaymentInfo('JingDong', payInfo, payUrl);

    let redirectUrl = `${server.h5root}/payment/jd`;
    if (__IS_APP__) {
      JSBridge.callNative('NavBar.setTitle', {title: '京东支付'});
    }
    window.location.href = redirectUrl;

  }

  componentDidMount() {
    this.clearPaymentInfo();
  }

  async repayScheduleWithLianLianPay(payInfo, payUrl) {
    this.savePaymentInfo('LianLian', payInfo, payUrl);

    let redirectUrl = `${server.h5root}/payment/lianlian`;
    if (__IS_APP__) {

      JSBridge.callNative('NavBar.setTitle', {title: '连连支付'});
    }
    window.location.href = redirectUrl;

  }

  savePaymentInfo(payType, payInfo, payUrl) {
    localStorage.setItem(
      LOAN_ORDER_PAYMENT_INFO,
      JSON.stringify({payType, payInfo, payUrl}),
    );
  }

  clearPaymentInfo() {
    localStorage.removeItem(LOAN_ORDER_PAYMENT_INFO);
  }


  goNext = () => {
    const{location} = this.props;
    let redirectUrl = `${server.h5root}?${location.search}`;

    setTimeout(() => {
      if (__IS_APP__) {
        JSBridge.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }, 300);

  }

  render() {
    const {applicationStore} = this.props;

    let rootElement = (
      <BankCardList
        list={applicationStore.boundlist}
        type={this.state.scenario}
        selectedCardId={this.state.selectedCardId}
        changeBankCard={this.changeBankCard.bind(this)}
        bindNewBankCard={this.bindNewBankCard.bind(this)}>
      </BankCardList>
    );

    if (this.state.setDefaultCard) {
      rootElement = <SucResultPage
        next={this.goNext.bind(this)}/>
    }

    return (
      <Page className="page-application page-select-bankcard" renderToolbar={this.renderToolbar}>
        {rootElement}
      </Page>
    );
  }
}

export default withRouter(SelectCardPage);


