import {observable, action} from 'mobx';
import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import merge from 'lodash/merge';

class PaymentStore {
  @observable paymentResult = {
    amout: 0,
    bankName: '',
    actualAmount: 0,
    frequency: 0,
    account: '',
    bankAccountId: 0,
  };

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

  @action orderApply = async(amount, frequency, bankAccountId) => {
    let result = await request.post(`${server.gateway}/order/apply`, {
      amount: amount,
      frequency: frequency,
      bankAccountId: bankAccountId,
    }, {showLoading: true});

    return result;
  }

  @action fetchPaymentResult = async() => {
    let result = await request.post(`${server.gateway}/loan/privilege`, {}, {showLoading: false});
    return result.privilege;
  }

  @action fetchOrderInfo = async() => {
    let result = await request.post(`${server.gateway}/loan/repayedOderInfo`, {}, {showLoading: false});
    this.paymentResult = result;
    return result;
  }

  @action fetchProducts = async() => {
    let products = await request.post(`${server.gateway}/loan/products`, {}, {showLoading: false});
    this.products = products;
    return products;
  }

  @action fetchPredict = async(amount, frequency) => {
    let predict = await request.post(
      `${server.gateway}/order/predict`,
      {amount, frequency},
      {showLoading: true}
    );
    predict = merge({amount, frequency}, predict);
    this.predict = predict;
    return predict;
  }

}

export default PaymentStore;

