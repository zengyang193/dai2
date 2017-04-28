import {observable, action} from 'mobx';
import merge from 'lodash/merge';

import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import stepRouterMap from 'scripts/constants/stepRouterMap';

class HomeStore {
  @observable products = null;

  @observable predict = {
    feeRate: 0,
    amount: 0,
    frequency: 0,
    productId: 0,
    realAmount: 0,
    repayAmount: 0,
    totalRepayAmount: 0,
  };

  @observable repayedOderInfo = null;

  @observable order = null;

  @action fetchProducts = async () => {
    let products = await request.post(`${server.gateway}/loan/products`, {}, {showLoading: false});
    this.products = products;
    return products;
  }

  @action fetchPredict = async (amount, frequency) => {
    let predict = await request.post(
      `${server.gateway}/order/predict`,
      {amount, frequency},
      {showLoading: false}
    );
    predict = merge({amount, frequency}, predict);
    this.predict = predict;
    return predict;
  }

  @action checkApply = async (lng, lat) => {
    let amount = this.predict.amount;
    let frequency = this.predict.frequency;
    let result = await request.post(
      `${server.gateway}/order/checkApply`,
      {amount, frequency, lng, lat},
      {showError: false}
    );
    return result;
  }
  @action fetchLoanOrder = async () => {
    // this.products = {
      // amounts: [1000, 1500],
      // frequencies: [15, 25],
    // };
    // this.order = {
      // loanAmount: 1000,
      // periodAmount: 1000,
      // loanDate: '2017-03-15',
      // loanTime: '18:18',
      // bankName: '招商银行',
      // bankAccount: '8888',
      // hasBankCard: true, // 订单是否绑卡
      // hasBoundCard: true,     // 用户是否已经绑过卡
      // originalId: 666666,
      // orderId: 888888,
      // remainDays: 3,
      // repayableAmount: 1000,
      // repaymentScheduleId: 777777,
      // nextApplyTime: null,
      // canRepay: 1,
      // notified: 1,
      // loanStatus: 'repayable',
    // };
    // return;

    let result = await request.post(`${server.gateway}/loan/info`, {}, {showLoading: false});
    this.products = result.products;

    if (!result.order) {
      this.order = null;
      return;
    }

    let order = result.order;

    let loanStatus;
    /*
     * 借款申请状态：
     *  -1 已取消
     *  0 拒绝
     *  1 审核中
     *  2 确认中
     *  3 准备放款
     *  4 已放款
     *  5 确认银行卡
     */
    switch (order.applyStatus) {
      case -1:
      case 0:
        loanStatus = 'rejected';
        break;
      case 1:
      case 2:
      case 5:
        loanStatus = 'reviewing';
        break;
      case 3:
        loanStatus = 'passed';
        break;
      case 4:
        loanStatus = 'lended';
        break;
    }

    /*
     * 贷款订单状态：
     *  0 出账
     *  1 初始化成功
     *  2 到期
     *  3 逾期
     *  151 逾期, 状态未知
     *  152 到期
     */
    switch (order.orderStatus) {
      case 0:
      case 1:
        loanStatus = 'lended';
        break;
      case 2:
        loanStatus = 'repayable';
        break;
      case 3:
      case 151:
      case 152:
        loanStatus = 'overdue';
        break;
    };

    /(\d{4}-\d{2}-\d{2}) (\d{1,2}:\d{1,2})/.test(order.applyTime);
    this.order = {
      repayAccount: order.repayAccount,
      repayBankName: order.repayBankName,
      loanAmount: order.applyAmount,
      periodAmount: order.periodAmount,
      loanDate: RegExp.$1,
      loanTime: RegExp.$2,
      bankName: order.bankName,
      bankAccount: order.bankAccount,
      hasBankCard: order.orderBindBankCard, // 订单是否绑卡
      hasBoundCard: order.bindBankCard,     // 用户是否已经绑过卡
      originalId: order.originalId,
      orderId: order.loanOrderId,
      remainDays: order.repayDay,
      repayableAmount: order.periodAmount,
      repaymentScheduleId: order.repaymentScheduleId,
      nextApplyTime: result.nextApplyTime,
      canRepay: order.canRepay,
      notified: order.notified,
      loanStatus,
    };
    return order;
  }

  async fetchNextRouter () {
    let step = await request.post(`${server.gateway}/basics/route`);
    return {
      name: step,
      path: stepRouterMap[step],
    };
  }

  async fetchRepayType (repaymentScheduleId, url = '') {
    let result = await request.post(`${server.gateway}/loan/repayType`, {repaymentScheduleId, url});
    return result;
  }

  @action updateLoanOrder (order) {
    this.order = order;
  }

  async logRepaymentReminder (loanOrderId) {
    return await request.post(`${server.gateway}/loan/repaymentNotify`, {loanOrderId});
  }


  async repayScheduleRequest (repaymentScheduleId) {
    let result = await request.post(`${server.gateway}/loan/repay`, {repaymentScheduleId});
    return result;
  }

  async orderApply (amount, frequency, bankAccountId) {
    let result = await request.post(
      `${server.gateway}/order/apply`,
      {amount: amount, frequency: frequency, bankAccountId: bankAccountId},
      {showError: false},
    );
    return result;
  }

  async fetchOrderInfo () {
    let result = await request.post(`${server.gateway}/loan/repayedOderInfo`, {}, {showLoading: false});
    this.repayedOderInfo = result;
    return result;
  }

}

export default HomeStore;
