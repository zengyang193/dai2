import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  List,
  ListItem,
  Icon,
  Modal,
} from 'react-onsenui';

@inject('store') @observer
class ResetPasswordPage4BJ extends Component {

  static defaultProps = {
    title: '重置服务密码',
  };

  state = {
    selectedSegment: 0,
    idInfo: null,
  };

  componentWillMount () {
    const { store } = this.props;
    let data = store.fetchCertificationInfoRequest();
    this.setState({ idInfo: data });
  }

  getResetPasswordLink () {
    const { store } = this.props;
    const { idInfo } = this.state;
    let idNo = idInfo.idNumber || '身份证号';

    const getSeperator = () => {
      let platform = __PLATFORM__;
      switch (platform) {
        case 'android':
          return '?';
        case 'ios':
          let version = +__OS_VERSION__.split('.')[0];
          if (version < 8 && version >= 7) { return ';'; }
          if (version >= 8) { return '&'; }
          break;
      }
    }

    let smsLink = `sms:10086${getSeperator()}body=${encodeURIComponent(`MMCZ ${idNo} 新密码 新密码`)}`;
    return smsLink;
  }

  onSegmentChange = (segment, evt) => {
    if (evt.target.checked) {
      this.setState({ selectedSegment: segment });
    }
  }

  onBackButtonClick = () => {
    const { history, location } = this.props;

    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
    } else {
      history.goBack();
    }
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClick={this.onBackButtonClick}>
            <Icon icon='ion-ios-arrow-left' />
          </ToolbarButton>
        </div>
        <div className="center">{this.props.title}</div>
      </Toolbar>
    );
  }

  render () {
    const { selectedSegment } = this.state;

    return (
      <Page className="page-resetpwd-bj" renderToolbar={this.renderToolbar}>
        <div className="button-bar">
          <div className="button-bar__item">
            <input type="radio" onChange={partial(this.onSegmentChange, 0)} name="segment-a" value="0" defaultChecked />
            <button className="button-bar__button">全球通</button>
          </div>
          <div className="button-bar__item">
            <input type="radio" onChange={partial(this.onSegmentChange, 1)} name="segment-a" value="1" />
            <button className="button-bar__button">神州行</button>
          </div>
          <div className="button-bar__item">
            <input type="radio" onChange={partial(this.onSegmentChange, 2)} name="segment-a" value="2"/>
            <button className="button-bar__button">动感地带</button>
          </div>
          <div className="button-bar__item">
            <input type="radio" onChange={partial(this.onSegmentChange, 3)} name="segment-a" value="3"/>
            <button className="button-bar__button">其他</button>
          </div>
        </div>
        <div className="content__block">
          <div className={`segment ${selectedSegment === 0 && 'active'}`}>
            <p>发送<em>“MMCZ空格证件号码空格新密码空格新密码”</em>至10086重新设置客服密码。</p>
            <p>
              <a
                target="__blank"
                className="button button--large"
                href={this.getResetPasswordLink()}>立即发送</a>
            </p>
          </div>
          <div className={`segment ${selectedSegment === 1 && 'active'}`}>
            <p>方法一：10086服务台重置服务密码</p>
            <p>本机拨打10086自动台，按提示成功验证身份证后，重新设置客服密码。</p>
            <p><a href="tel://10086" target="__blank" className="button button--large">立即拨打</a></p>
            <p>方法二：网站重置服务密码</p>
            <p>网址：
              <textarea
                style={{width: '100%'}}
                defaultValue="http://service.bj.10086.cn/poffice/package/showpackage.action?from=bj&amp;PACKAGECODE=KFMMYW&amp;isCheck=1"
                rows="4"
                className="js-select-on-focus">
              </textarea>
            </p>
            <p>进入网址，选择密码重置，然后再选择通话记录，最后点击立即办理。</p>
          </div>
          <div className={`segment ${selectedSegment === 2 && 'active'}`}>
            <p>方法一：10086服务台重置服务密码</p>
            <p>本机拨打10086自动台，按提示成功验证身份证后，重新设置客服密码。</p>
            <p><a href="tel://10086" target="__blank" className="button button--large">立即拨打</a></p>
            <p>方法二：网站重置服务密码</p>
            <p>网址：
              <textarea
                style={{width: '100%'}}
                defaultValue="http://service.bj.10086.cn/poffice/package/showpackage.action?from=bj&amp;PACKAGECODE=KFMMYW&amp;isCheck=1"
                rows="4"
                className="js-select-on-focus">
              </textarea>
            </p>
            <p>进入网址，选择密码重置，然后再选择通话记录，最后点击立即办理。</p>
          </div>
          <div className={`segment ${selectedSegment === 3 && 'active'}`}>
            <p>方法一：10086服务台重置服务密码</p>
            <p>畅听卡、家园卡、5元卡客户，本机拨打10086自动台，按提示成功验证身份证后，重新设置客服密码。</p>
            <p>方法二：营业厅重置服务密码</p>
            <p>个人客户：凭本人有效身份证件原件、原密码申请修改客服密码；持本人有效身份证件原件，即可申请重新设置客服密码，不可代办。非实名制客户重置客服密码时，除以上手续外，还需提供近90天内3条通话或短信记录，其中至少有一条是主叫通话记录办理。</p>
            <p>单位客户：凭经办人有效身份证件原件、单位正规介绍信申请重新设置客服密码；申请修改密码时还需提供原密码。</p>
          </div>
        </div>
      </Page>
    );
  }
}

export default withRouter(ResetPasswordPage4BJ);
