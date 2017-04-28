import 'styles/components/home/HomePage.scss';

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import ons from 'onsenui';
import {
  Page,
  Tabbar,
  Toolbar,
  ToolbarButton,
  Tab,
  Icon,
  Button,
} from 'react-onsenui';

import LoanForm from './LoanForm';
import LoanOrderInfo from './LoanOrderInfo';
import ProgressCircular from 'scripts/components/ProgressCircular';
import server from 'scripts/config/server';
import UserUtil from 'scripts/utils/user';
import ModalUtil from 'scripts/utils/modal';
import bizLog from 'scripts/adapters/businessLog';
import JSB from 'scripts/adapters/jsbridge';
import {
  SHOW_GFD_USER_PROFILE_TIP,
  LOAN_ORDER_PREDICT_RESULT
} from 'scripts/constants/localStorageKeys';
import { PDL_CREDIT } from 'scripts/constants/profileSteps';

@inject((stores) => ({
  homeStore: stores.homeStore
}))
@observer
class HomePage extends Component {
  static defaultProps = {
    title: '开薪贷',
  };

  state = {
    hasOrder: false,        //用户是否有订单
    dataReady: false,       //页面初始化数据是否加载完成
    waitApplyingLoan: false,//未登录状态下点击马上申请，等待登录成功
  };

  componentDidMount () {
    const { title } = this.props;
    document.title = title;
  }

  componentWillMount () {
    this.fetchInitialData();
    JSB.registerJSEventHandler('viewappear', this.componentDidAppear);
  }

  componentWillUnmount () {
    JSB.removeJSEventHandler('viewappear', this.componentDidAppear);
  }

  componentWillReceiveProps (nextProps) {
    const { isLogged } = this.props;
    const { isLogged: nextIsLogged, homeStore } = nextProps;
    const { waitApplyingLoan } = this.state;

    if (!isLogged && nextIsLogged) {
      setTimeout(async () => {
        await homeStore.fetchLoanOrder();
        let hasOrder = homeStore.order !== null;
        if (!hasOrder && waitApplyingLoan) {
          this.applyLoan();
          this.setState({ waitApplyingLoan: false });
        }
        this.setState({ hasOrder });
      });
    }
  }

  componentDidAppear =  () => {
    this.fetchInitialData();
  }

  async fetchInitialData () {
    const { homeStore, isLogged } = this.props;
    let hasOrder = false;

    if (isLogged) {
      await homeStore.fetchLoanOrder();
      //加载完成将localStorage中的selectBankInfo清空
      localStorage.setItem('selectBankInfo', '');

      hasOrder = homeStore.order !== null;
    } else {
      await homeStore.fetchProducts();
    }

    this.setState({ dataReady: true, hasOrder});
    if (!hasOrder) {
      let formData = this.refs.loanForm.getFormData();
      await homeStore.fetchPredict(formData.amount, formData.frequency);
      if (isLogged)
        await homeStore.fetchOrderInfo();
    }
  }

  showFAQ = () => {
    const { location, isLogged } = this.props;
    const redirectUrl = `${server.h5root}/faq${location.search}`;
    const startRedirect = () => {
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
    };

    if (isLogged) {
      setTimeout(startRedirect, 300);
      bizLog.logWithStep('1005');
    } else {
      startRedirect();
    }
  }

  renderToolbar = () => {
    return (
      <Toolbar modifier="transparent">
        <div className='center'>{this.props.title}</div>
        <div className="right">
          <ToolbarButton onClick={this.showFAQ}>
            <Icon icon='ion-ios-help-outline' />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  async fetchPredict (data) {
    const { homeStore } = this.props;
    homeStore.fetchPredict(data.amount, data.frequency);
  }

  async applyLoan () {
    const { homeStore, isLogged, showLoginDialog } = this.props;
    if (!isLogged) {
      showLoginDialog();
      this.setState({ waitApplyingLoan: true });
      return;
    }

    bizLog.logWithStep('2001');
    try {
      let data = await this.checkApply();

      if (!data.allow) {
        ons.notification.alert({
          title: '提示',
          message: data.tip || '',
          buttonLabels: '我知道了',
        });
        return;
      }

      if (data.type === 1) {
        let buttonIndex = await ons.notification.alert({
          title: '提示',
          message: data.tip || '',
          'class': 'limit-exceeded-dialog',
          buttonLabels: ['填写资料预约排队', '下次再说'],
        });

        if (buttonIndex === 1) {
          return;
        }
      }

      let hasShownTip = Number(localStorage.getItem(SHOW_GFD_USER_PROFILE_TIP));
      if (data.treeFinanceAppId === 1 && !hasShownTip) {
        await ons.notification.alert({
          title: '提示',
          message: '系统检测到您是大树金融旗下App用户，若有共同资料，将为您自动同步资料数据。',
          buttonLabels: '我知道了',
        });
        localStorage.setItem(SHOW_GFD_USER_PROFILE_TIP, 1);
      }

      const predict = homeStore.predict;
      localStorage.setItem(LOAN_ORDER_PREDICT_RESULT, JSON.stringify({
        amount: predict.amount,
        frequency: predict.frequency,
      }));

      let nRouter = await homeStore.fetchNextRouter();
      let path = nRouter.path;
      let title = '申请贷款';
      if (nRouter.name === PDL_CREDIT) {

        let buttonMsg = '确认借款并设置银行卡';
        let booleanHasOrderInfo = false;
        if (homeStore.repayedOderInfo && homeStore.repayedOderInfo.bankAccountId) {
          buttonMsg = '马上申请';
          booleanHasOrderInfo = true;
        }

        let buttonIndex = await ons.notification.confirm({
          title: '提示',
          message: '确定借款吗？将为您产生一笔借款。',
          buttonLabels: [`${buttonMsg}`, '取消'],
          'class': 'order-application-dialog',
        });

        if (buttonIndex === 0) {

          bizLog.logWithStep('7002');//设置银行卡

          let order = await homeStore.orderApply(predict.amount, predict.frequency, booleanHasOrderInfo ? homeStore.repayedOderInfo.bankAccountId : 0);

          bizLog.logWithStep('7001');//生成订单

          if (booleanHasOrderInfo) {
            path = '/application/sucresult';
            title = '贷款结果';
          } else {
            path = `/application/${order.orderId}/${order.isBindBankCard ? 'selectcard' : 'bindcard'}?scenario=application`;
            title = order.isBindBankCard ? '选择银行卡' : '绑定银行卡';
          }

        } else {
          return;
        }
      }
      let redirectUrl = `${server.h5root}${path}`;

      if (__IS_APP__) {
        JSB.callNative('Controller.push', {
          type: 'url',
          title: title,
          url: redirectUrl,
          showNavigationBar: true,
        });
      } else {
        window.location.href = redirectUrl;
      }
    } catch (ex) {
      ons.notification.alert({
        title: '提示',
        message: ex.data.errorMsg,
        buttonLabels: '我知道了',
      });
    }
  }

  async checkApply () {
    const { homeStore } = this.props;
    return new Promise(async (resolve, reject) => {
      if (__IS_APP__) {
        ModalUtil.showPreloader();
        JSB.callNative('Geolocation.get', {}, async (result) => {
          ModalUtil.hidePreloader();
          if (result.code !== 0) {
            ons.notification.alert({
              title: '提示',
              message: result.errMsg,
              buttonLabels: '确定',
            });
            return;
          }

          const geoLoc = result.data;
          try {
            let data = await homeStore.checkApply(geoLoc.longitude, geoLoc.latitude);
            resolve(data);
          } catch (ex) {
            reject(ex);
          }
        });
      } else {
        //try {
          //let data = await homeStore.checkApply('120.19', '30.26');
          //resolve(data);
        //} catch (err) {
          //reject(err);
        //}
        reject({data: { errorMsg: '请下载开薪贷App进行申请' }});
      }
    });
  }

  render () {
    const { homeStore } = this.props;
    const { amountIndex, frequencyIndex, dataReady } = this.state;
    const products = homeStore.products;
    const predict = homeStore.predict;
    const repayedOderInfo = homeStore.repayedOderInfo;
    const hasOrder = homeStore.order !== null;

    return (
      <Page className="page-home" renderToolbar={this.renderToolbar}>
        <div className="loan-container">
          <div className="loan-amount-wrapper">
            <div className="loan-amount">
              {hasOrder ? homeStore.order.loanAmount : predict.repayAmount}
            </div>
          </div>
          {dataReady && !hasOrder &&
            <div className="loan-predict">
              <div className="predict-item">
                <div className="item-label">
                  <i className='kxd-icon-real-amount' />
                  <span className="label-text">实际到账</span>
                </div>
                <div className="item-value">
                  <span className="amount">{predict.realAmount}</span>元
                </div>
              </div>
              <div className="predict-item">
                <div className="item-label">
                  <i className='kxd-icon-repayment' />
                  <span className="label-text">到期应还</span>
                </div>
                <div className="item-value">
                  <span className="amount">{predict.totalRepayAmount}</span>元
                </div>
              </div>
              <div className="predict-item">
                <div className="item-label">
                  <i className='kxd-icon-calendar' />
                  <span className="label-text">贷款期限</span>
                </div>
                <div className="item-value">
                  <span className="amount">{predict.frequency}</span>天
                </div>
              </div>
            </div>
          }
        </div>
        {dataReady && hasOrder && <LoanOrderInfo order={homeStore.order}/>}
        {dataReady && !hasOrder && products &&
          <LoanForm
            ref="loanForm"
            repayedOderInfo={repayedOderInfo}
            products={products}
            amountIndex={amountIndex}
            frequencyIndex={frequencyIndex}
            onFormDataChanged={this.fetchPredict.bind(this)}
            onFormSubmit={this.applyLoan.bind(this)}/>
        }
        {dataReady ||
          <div className="product-loading-container">
            <ProgressCircular indeterminate className="product-loading"/>
          </div>
        }
      </Page>
    );
  }
}

export default withRouter(HomePage);
