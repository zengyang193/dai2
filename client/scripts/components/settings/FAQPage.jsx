import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
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

import 'styles/components/settings/FAQPage.scss';

class QuestionItem extends Component {
  switchAsked = (e) => {
    if (this.refs.faqAsked.className == 'faq-asked-none') {
      this.refs.faqAsked.className = 'faq-asked';
      this.refs.faqChevron.className = 'ion-chevron-up faq-chevron';
    } else {
      this.refs.faqAsked.className = 'faq-asked-none';
      this.refs.faqChevron.className = 'ion-chevron-down faq-chevron';
    }
    e.target.scrollIntoView();
  }

  render() {
    let {question,asked} = this.props;
    return (
      <li className="faq-item">
        <div className="faq-question" onClick={this.switchAsked}>
          <div className="faq-question-content">{question}</div>
          <div className="ion-chevron-down faq-chevron" ref="faqChevron"/>
        </div>
        <div className="faq-asked-none" ref="faqAsked">
          {asked}
        </div>
      </li>
    );
  }
}

class FAQPage extends Component {
  state = {
    faq: [{
      question: '1.「开薪贷」能为我提供什么样的贷款服务？',
      asked: '作为杭州大树网络技术有限公司旗下的微额信用贷款产品，「开薪贷」致力于为用户提供最贴心便捷的线上应急钱包功能，满足用户在发薪日到来之前的周转需求。'
    },
      {
        question: '2.「开薪贷」目前对哪些地区开放？',
        asked: '「开薪贷」目前已开放的区域：广东省，江苏省，山东省，浙江省，河南省，四川省，湖北省，河北省，湖南省，福建省，上海市，北京市，安徽省，陕西省，江西省，广西壮族自治区，天津市，重庆市，云南省，贵州省，甘肃省，海南省，山西省，辽宁省，吉林省，黑龙江省等。'
      },
      {
        question: '3.需要具备哪些条件才可以申请贷款？',
        asked: '年龄在18-55周岁之间的用户，凭借本人基本资料、身份证照片、手机运营商及银行卡信息（用于放款和还款），即可在「开薪贷」申请贷款。'
      },
      {
        question: '4.「开薪贷」是否能确保我的信息安全？',
        asked: '您的信息安全将得到「开薪贷」的全面保障。「开薪贷」将严格遵守监管部门的规定，对用户的个人信息进行保密。'
      },
      {
        question: '5.贷款额度是多少？',
        asked: '「开薪贷」主要为用户提供两种贷款额度，分别为1000元和1500元。'
      },
      {
        question: '6.还款期限是多久？',
        asked: '「开薪贷」的还款期限共有两种，分别是15天和25天。'
      },
      {
        question: '7.贷款利息如何计算？',
        asked: '「开薪贷」平台将通过用户提交的申请材料对用户的信用状况进行信用等级评估；不同信用等级的用户将采取不同的费率计算方式。'
      },
      {
        question: '8.联系人上传不了怎么办？',
        asked: '请根据页面提示进行操作。如果依旧无法上传，请检查是否对「开薪贷」APP已开放了通讯录或联系人的访问权限。'
      },
      {
        question: '9.芝麻信用授权失败怎么办？',
        asked: '当系统提示您「支付宝账号不存在」时，请打开支付宝手机客户端，进入「我的－设置－手机号－更换手机号」即可。如非上述情况，建议联系芝麻信用客服或更换网络环境后重试。'
      },
      {
        question: '10.手机运营商验证失败怎么办？',
        asked: '请确认当前使用的手机号码是否为本人实名认证号码，或检查网络后再进行尝试。'
      },
      {
        question: '11.贷款申请审核需要多久？',
        asked: '贷款申请提交后，将由系统进行全自动审核，最快仅需5分钟。'
      },
      {
        question: '12.如何获得审核结果？',
        asked: '「开薪贷」会通过短信及APP推送消息第一时间告知用户贷款结果。'
      },
      {
        question: '13.为什么我的贷款申请未通过审核？',
        asked: '「开薪贷」会从多维度综合评判用户的贷款申请。如未通过审核，可能是由于您目前的申请状态未达到标准，建议您过段时间再尝试重新申请。'
      },
      {
        question: '14.贷款申请通过后，需要多久到款？',
        asked: '贷款申请通过后即时放款，实际到账时间以收款银行处理为准。'
      },
      {
        question: '15.什么实际到账金额少于提现金额？',
        asked: '「开薪贷」为借款人的融资项目提供信息服务，并在借款人融资成功后收取一定的服务费用。在借款人成功收取放款时，「开薪贷」将直接扣除相应的信息服务费，因此您的实际到账金额会少于提现金额。关于服务费的更多信息详见贷后管理服务协议。'
      },
      {
        question: '16.如何进行还款？',
        asked: '「开薪贷」支持以下两种还款方式：自动还款。请保证绑定的银行卡内余额充足，系统最迟会在账单日当天晚上19:30自动扣款；主动还款。打开「开薪贷」APP，进入首页后，点击「我要还款」即可使用京东支付进行主动还款。温馨提示：「开薪贷」仅支持在APP／微信服务号两个平台为用户直接提供提前结清欠款或常规还款的服务。如遇到其他以「开薪贷」名义要求以现金交易或转账汇款形式完成还款的行为，务必提高警惕，谨防受骗，并在第一时间联系「开薪贷」客服确认虚实。'
      },
      {
        question: '17.用户特权具体是指什么？',
        asked: '保持良好的信用记录与还款习惯，可触发「开薪贷」VIP高额贷款特权，额度分别为1888元、2888元、3888元不等。'
      },
      {
        question: '18.逾期会有什么后果？',
        asked: '如果您未能在账单日按时还款，实际还款时则需要支付相应的罚息及违约金。友情提醒：按时还款，拒绝逾期，才能保持良好的个人信用记录哟！'
      },
      {
        question: '19.如何联系「开薪贷」客服？',
        asked: '关注「开薪贷」官方微信服务号：微信搜索并添加「开薪管家」或「dashukaixindai」，即可向在线客服咨询疑问。'
      }
    ],
  };

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
        <div className="left">
          <ToolbarButton onClick={this.onBackButtonClick}>
            <Icon icon='ion-ios-arrow-left'/>
          </ToolbarButton>
        </div>
        <div className="center">常见问题</div>
      </Toolbar>
    );
  }


  render() {

    let questionItem = this.state.faq.map((item, idx) => {
      return (<QuestionItem question={item.question} asked={item.asked} key={idx} />);
    });
    return (
      <Page className="page-settings-faq" renderToolbar={this.renderToolbar}>
        <div className="faq-container">
          <ul>{questionItem}</ul>
        </div>
      </Page>
    );
  }
}

export default withRouter(FAQPage);
