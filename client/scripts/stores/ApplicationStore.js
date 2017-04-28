import {observable, action} from 'mobx';
import request from 'scripts/utils/request';
import server from 'scripts/config/server';

class ApplicationStore {
  @observable showCardErrorMsg = false;
  @observable cardCategory = {
    bankId: null,
    bankName: null,
    cardNo: null,
    cardType: null,
    isSupport: true,
    message: null,
  };
  @observable boundlist = [];
  @observable changeCardSuc = false;
  @observable idcardInfo;
  @observable supportBankList = [];
  @observable selectBankCard = null;
  @observable orderNo;
  @observable oriOrderId;

  // 临时保存绑卡的数据
  @observable tempBankCardInfo = {
    code: null,
    mobile: null,
    bankCardNo: null,
  };

  /**
   * 获取身份证信息
   */
  @action fetchIdCardInfo = async() => {
    try {
      let result = await request.post(`${server.gateway}/idcard/info`);
      this.idcardInfo = result;
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * 获取支持的银行列表
   */
  @action fetchSupportBanklist = async() => {
    try {
      let result = await request.post(`${server.gateway}/bankcard/support/banklist`);
      this.supportBankList = result;
    } catch (ex) {
      console.error();
    }
  }

  /**
   *  查询发卡行
   * @param cardNO
   */
  @action fetchCardCategory = async(cardNo) => {
    try {
      let result = await request.post(`${server.gateway}/bankcard/cardCategory`, {cardNo: cardNo});
      this.cardCategory = result;
      this.showCardErrorMsg = true;
    } catch (ex) {
      this.showCardErrorMsg = false;
      console.error(ex);
    }
  }

  /**
   * 已绑定的银行卡列表
   * @param oriOrderId 原始订单id
   */
  @action fetchBoundlist = async(oriOrderId) => {
    try {
      let result = await request.post(`${server.gateway}/bankcard/boundlist`, {oriOrderId: oriOrderId});
      console.log(result);
      this.boundlist = result.cardList;
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * 设置默认卡
   * @param cardId  银行卡帐户id
   */
  async setDefaultCard (cardId) {
    return await request.post(`${server.gateway}/bankcard/setDefault`, {cardId});
  }

  /**
   * 贷前 跟换放款银行卡
   * @param oriOrderId
   * @param cardId
   * @returns {*|Request|AxiosPromise}
   */
  async changeBankCard (oriOrderId, cardId) {
    return await request.post(`${server.gateway}/bankcard/changCard`, {cardId, oriOrderId});
  }

  /**
   * 贷后 跟换还款银行卡
   * @param loanOrderId
   * @param cardId
   * @returns {*|Request|AxiosPromise}
   */
  async changeRepayBankCard (loanOrderId, cardId) {
    return await request.post(`${server.gateway}/loan/repayCard/change`, {cardId, loanOrderId});
  }

  /**
   * 更换银行卡
   * @param oriOrderId  原始订单id
   * @param cardId  银行卡帐户id
   */
  @action changCard = async(oriOrderId, cardId) => {
    try {
      await request.post(`${server.gateway}/bankcard/changCard`, {
        oriOrderId: oriOrderId,
        cardId: cardId,
      });
      this.changeCardSuc = true;
    } catch (ex) {
      console.error(ex);
      this.changeCardSuc = false;
    }
  }

  /**
   * 绑卡发送验证码
   * @param mobile
   * @param cardNo  卡号
   * @param bankId  银行ID
   */
  @action sendSMSCode = async(mobile, cardNo, bankId) => {
    try {
      let result = await request.post(`${server.gateway}/bankcard/captcha/sending`, {
        mobile: mobile,
        cardNo: cardNo,
        bankId: bankId,
      });
      this.orderNo = result;
    } catch (ex) {
      console.error(ex);
    }
  }
  /**
   * 重发绑卡发送验证码
   * @param mobile
   * @param orderNo 首次发送验证码返回的订单号
   */
  @action reSendSMSCode = async(mobile, orderNo) => {
    try {
      await request.post(`${server.gateway}/bankcard/captcha/resending`, {
        mobile: mobile,
        orderNo: orderNo,
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * 绑卡
   * @param mobile  手机号
   * @param bankId  银行id
   * @param cardNo  银行卡号
   * @param oriOrderId  原始订单号 (可选)
   * @param code  验证码
   * @param orderNo 首次发送验证码返回的订单号
   */
  async bindCardAction (mobile, bankId, cardNo, oriOrderId, code, orderNo) {
    await request.post(`${server.gateway}/bankcard/binding`, {
      mobile: mobile,
      bankId: bankId,
      cardNo: cardNo,
      oriOrderId: oriOrderId,
      code: code,
      orderNo: orderNo,
    });
  }
}

export default ApplicationStore;
