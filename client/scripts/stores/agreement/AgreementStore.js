import {observable, action} from 'mobx';
import server from 'scripts/config/server';
import request from 'scripts/utils/request';

class AgreementStore {
  @observable authorizationLetter = {
    userName: '',
    bankId: '',
    bankName: '',
    cardNo: '',
    userIdentity: '',
    mobile: '',
    contractStartDate: '',
    client: '',
    effectiveDate: '',
  };


  @observable intermediaryServiceInfo = {
    userName: '',
    userIdentity: '',
    loanAmount: 0,
    loanAmtStr: '',
    loanRate: 0,
    feeRate: '',
    applyNo: 0,
    loanUse: '',
    startDate: '',
    endDate: '',
    periodCount: 0,
    ownFeeRate: '',
    lenderName: '',
    lenderIdentity: '',
    investorShareList: '',
    repaymentProtocolList: [],
  };
  @action fetchAuthorizationLetterInfoRequest = async(loanOrderId) => {
    try {
      let result = await request.post(`${server.gateway}/loan/entrustProtocol`, {loanOrderId: loanOrderId});
      this.authorizationLetter = result;
    } catch (ex) {
      console.error(ex);
    }
  }

  @action fetchIntermediaryServiceRequest = async(loanOrderId) => {
    try {
      let result = await request.post(`${server.gateway}/loan/loanProtocol`, {loanOrderId: loanOrderId});
      this.intermediaryServiceInfo = result;
    } catch (ex) {
      console.error(ex);
    }
  }
}

export default AgreementStore;
