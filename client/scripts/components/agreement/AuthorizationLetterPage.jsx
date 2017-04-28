import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
import queryString from 'query-string';
import {
  Page,
  Tabbar,
  Toolbar,
  ToolbarButton,
  Tab,
  Icon,
  ListItem,
  List,
  ListHeader,
  Modal,
  Button,
  AlertDialog
} from 'react-onsenui';

import 'styles/components/agreement/AgreementPage.scss';

@inject('agreementStore') @observer
class UserServiceAgreementPage extends Component {
  constructor (props) {
    super(props);

    const { location } = props;
    this.query = queryString.parse(location.search);
  }

  componentWillMount () {
    const { agreementStore } = this.props;
    const query = this.query;
    let loanOrderId = query.loanOrderId;
    if (loanOrderId) {
      agreementStore.fetchAuthorizationLetterInfoRequest(loanOrderId);
    }
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
        <div className="center">委托授权书</div>
      </Toolbar>
    );
  }


  render() {
    let { agreementStore } = this.props;
    let dateArr = '';
    if(agreementStore.authorizationLetter && agreementStore.authorizationLetter.contractStartDate){
      dateArr = agreementStore.authorizationLetter.contractStartDate;
    }
    dateArr = dateArr.split('-');
    return (
      <Page className="page-agreement"
            renderToolbar={this.renderToolbar}
      >
        <div className="user-service">

          <p>鉴于授权人为杭州大树网络技术有限公司（以下简称“大树网络”、“被授权人”）运营的网络借贷信息中介平台的融资人（以下简称“授权人”、“融资人”），与大树网络推荐的贷款人签署了电子版贷款协议，授权人同意并授权大树网络按照本委托授权书的约定为贷款协议与《居间服务协议》项下的相关款项提供资金代扣、代还、代付及划转服务。</p>
          <p>授权人在此通过本委托授权书作出如下授权与承诺：</p>
          <p>一、授权人同意被授权人在本授权书约定的期限内，委托银行或与大树网络合作的第三方支付机构从本授权书指定的借记卡账户、信用卡账户内按照贷款协议与《居间服务协议》等相关协议的约定进行资金的代扣、代还、代付及划转应付款项。</p>
          <p>二、本授权书项下的应付款项包括：本金、利息、服务费、逾期利息、违约金、损害赔偿金和实现债权的费用等授权人所有应付款项。</p>
          <p>三、授权人承诺本授权书第十四条记载的授权代扣账户是以本人真实姓名开立的合法、有效的借记卡账户和信用卡账户；授权人同意在该授权账户中，本授权书第一条、第二条约定的资金代扣及转账优先于其他任何用途的支付。</p>
          <p>四、授权人同意，在贷款协议等相关协议约定的融资成功后，将款项汇入授权借记卡账户，因此引起的任何后果，由授权人承担。</p>
          <p>五、授权人在签署贷款协议后，协议签订之日为起息日，还款日是指协议中约定的还款日期。授权人应与还款日将足额的应付款项存放至本授权书第十四条记载的授权人的授权借记卡账户中。大树网络有权于上述约定的还款日当日及逾期后的任何一日按照贷款协议与《居间服务协议》的约定从该授权借记卡账户中将授权人的应付资金划转至贷款人指定的还款接收账户或者被授权人账户。</p>
          <p>六、授权人在指定账户中必须留有足够余额，否则因账户余额不足或不可归责于被授权人的任何事由，导致无法及时扣款或扣款错误、失败，责任由授权人自行承担。</p>
          <p>七、授权人知悉大树网络对此项资金代扣、代还、代付及划转服务不收费，大树网络会尽其最大努力及时完成此项资金划转服务，但大树网络不对此项服务作任何承诺。与本授权书项下的资金代扣、代还、代付及划转服务相关的任何责任，与大树网络无关，大树网络亦无义务承担。</p>
          <p>八、贷款人转让贷款协议项下的债权的，不影响本授权书的有效性。</p>
          <p>九、本授权书为授权人对大树网络从其授权账户中扣款和/或向其授权账户转账的授权证明，不作为收付现金的凭据。</p>
          <p>十、凡本授权书中未约定的事项，适用贷款协议与《居间服务协议》的约定。凡本授权书中出现的与贷款协议与《居间服务协议》相同的词语或术语，如果在本授权书中无特别定义，适用贷款协议与《居间服务协议》中相同词语和术语的定义、涵义或解释。本授权书的规定与贷款协议与《居间服务协议》不一致的，以本授权书的规定为准。</p>
          <p>十一、授权人同意终止授权或变更账户、通讯地址时，应于当期应付款项交付日前30天前通知被授权人，否则自行承担所造成的风险损失。</p>
          <p>十二、授权人保证本授权书的真实性、合法性、有效性，被授权人依据本授权书进行的委托扣款操作引起的一切法律纠纷或风险，由授权人独立承担或解决。</p>
          <p>十三、本授权书自授权人以网络页面点击确认或者其他方式（包括但不限于以邮件、短信回复确认签署等方式）确认同意起生效，至授权人贷款协议与《居间服务协议》履行完毕，所有款项全部还清时终止。</p>
          <p>十四、授权人资金代扣及转账资料：</p>
          <table className="tos-table">
            <tbody><tr>
              <th style={{width:'40%'}}>借记卡户名</th>
              <td>{agreementStore.authorizationLetter.userName}</td>
            </tr>
            <tr>
              <th style={{width:'40%'}}>借记卡开户银行</th>
              <td>{agreementStore.authorizationLetter.bankName}</td>
            </tr>
            <tr>
              <th style={{width:'40%'}}>借记卡账号</th>
              <td>{agreementStore.authorizationLetter.cardNo}</td>
            </tr>
            <tr>
              <th style={{width:'40%'}}>身份证号码</th>
              <td>{agreementStore.authorizationLetter.userIdentity}</td>
            </tr>
            <tr>
              <th style={{width:'40%'}}>联系手机</th>
              <td>{agreementStore.authorizationLetter.mobile}</td>
            </tr>
            </tbody></table>
          <p>被授权人：<span className="baseline-long">杭州大树网络技术有限公司</span></p>
          <p>授权人：<span className="baseline-long">{agreementStore.authorizationLetter.client}</span></p>
          <p className="date text-right">
            日期：
            <span className="baseline-short text-center">{dateArr[0]}</span>年
            <span className="baseline-short text-center">{dateArr[1]}</span>月
            <span className="baseline-short text-center">{dateArr[2]}</span>日
          </p>
        </div>
      </Page>
    )
  }
}

export default withRouter(UserServiceAgreementPage);
