import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import queryString from 'query-string';
import classNames from 'classnames';
import ons from 'onsenui';
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
import server from 'scripts/config/server';
import { Form, Input } from 'scripts/components/form/Form';
import AccountOperationMixin from 'scripts/components/slogin/operator/AccountOperationMixin';
import ProgressCircular from 'scripts/components/ProgressCircular';
import { simplifyQueryString } from 'scripts/utils/url';
import ModalUtil from 'scripts/utils/modal';
import { isMobile } from 'scripts/utils/validation';

@inject('store') @observer
class OperatorLoginPage extends Component {

  static defaultProps = {
    title: '运营商登录',
  };

  constructor (props) {
    super(props);

    let { match: { params }, location } = props;
    this.state = {
      smsTimeout: 0,
      submitDisabled: true,
      needsCaptcha: params.type === 'jx',
    };
    this.query = queryString.parse(location.search);
    this.handleResetPassword = AccountOperationMixin.handleResetPassword.bind(this);
  }

  componentWillMount () {
    const { store } = this.props;
    const query = this.query;
    store.fetchForgetPasswordConfigRequest(query.key);
    store.fetchOperatorTipRequest(query.key);
    this.fetchLoginPage();
  }

  async fetchLoginPage () {
    const { store } = this.props;
    const query = this.query;
    const {needsCaptcha} = this.state;
    await store.fetchLoginPageRequest(query.key, !needsCaptcha);
    if (needsCaptcha) {
      this.refreshCaptchaCode();
    }
  }

  async refreshCaptchaCode () {
    const { store } = this.props;
    const query = this.query;
    store.refreshCaptchaCodeRequest(query.key);
  }

  async refreshSMSCode (mobile) {
    const { store } = this.props;
    const query = this.query;
    try {
      await store.refreshCaptchaCodeV1Request(query.key, mobile);
    } catch(err) {
      let { status, data } = err;
      if (status == 401) {
        ons.notification.alert({
          title: '提示',
          message: '登录超时，请退出重新登录',
          buttonLabels: '知道了',
        });
      } else if (status == 408) {
        await ons.notification.alert({
          title: '提示',
          message: '登录超时，请重试',
          buttonLabels: '知道了',
        });
        this.fetchLoginPage();
      } else {
        ons.notification.alert({
          title: '提示',
          message: data.errorMsg || '登录失败，请重试',
          buttonLabels: '知道了',
        });
      }
    }
  }

  sendSMSCode = () => {
    const { store } = this.props;
    const { needsCaptcha } = this.state;
    let formData = this.refs.loginForm.getModel();
    let mobile = formData.username;
    let smsTimeout = this.state.smsTimeout;

    if (needsCaptcha && !store.loginCaptcha) {
      ModalUtil.toast('正在获取图片验证码');
      return;
    }

    if (!smsTimeout) {
      if (!isMobile(mobile)) {
        ModalUtil.toast('请输入正确的手机号');
        return;
      }

      this.setState({ smsTimeout: 60});
      this.smsInterval = setInterval(() => {
        let nextTick = this.state.smsTimeout - 1;
        this.setState({ smsTimeout: nextTick });
        if (nextTick === 0) {
          clearInterval(this.smsInterval);
        }
      }, 1000);
      this.refreshSMSCode(mobile);
    }
  }

  async startLogin () {
    let { store } = this.props;
    const query = this.query;
    let formData = this.refs.loginForm.getModel();
    let params = [
      query.key,
      formData.username,
      formData.password,
      formData.randomPassword,
      formData.code || '',
    ];

    try {
      await store.loginV1Request(...params);
      if (__IS_APP__) {
        window.location.href = `${server.h5root}/slogin/operator/success`;
      } else {
        let queryStr = location.search.substring(1);
        queryStr = simplifyQueryString(queryStr, ['key', 'title']);
        window.location.replace(`${server.h5root}/profile/operator?${queryStr}`);
      }
    } catch (err) {
      let { status, data } = err;
      if (status == 401) {
        ons.notification.alert({
          title: '提示',
          message: '登录超时，请退出重新登录',
          buttonLabels: '知道了',
        });
      } else if (status == 408) {
        await ons.notification.alert({
          title: '提示',
          message: '登录超时，请重试',
          buttonLabels: '知道了',
        });
        this.fetchLoginPage();
      } else {
        await ons.notification.alert({
          title: '提示',
          message: data.errorMsg || '登录失败，请重试',
          buttons: '知道了',
        });

        //this.refs.passwordField.setValue('');
        //this.refs.randomPasswordField.setValue('');
        this.refs.captchaField.setValue('');

        if (this.state.needsCaptcha) {
          this.refreshCaptchaCode();
        }
      }
    }
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton>
            <Icon icon='ion-ios-arrow-left' />
          </ToolbarButton>
        </div>
        <div className="center">{this.query.title || this.props.title}</div>
        <div className="right">
          <ToolbarButton>
            <Icon icon='ion-ios-help-outline' />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  showResetPassword = () => {
    const { store } = this.props;
    const params = store.resetPwdConfig;
    if (params) {
      this.handleResetPassword(params);
    }
  }

  disableSubmit () {
    this.setState({ submitDisabled: true });
  }

  enableSubmit () {
    this.setState({ submitDisabled: false });
  }

  render () {
    const { store } = this.props;
    const {smsTimeout, needsCaptcha} = this.state;
    let smsButtonDisabled = smsTimeout || ( needsCaptcha && !store.loginCaptcha);
    let smsButtonClass = classNames({
      'button-plain': true,
      'disabled': smsButtonDisabled,
    });
    let smsButtonText = smsTimeout ? `${smsTimeout}秒后重新获取` : '点击获取';

    let tips = store.loginTip.slice();
    let tipElements = [];
    if (tips.length === 0) {
      tips = ['请谨慎输入，多次错误将导致被锁'];
    }
    tips.forEach((tip, idx) => {
      tipElements.push(<span key={`tip-span-${idx}`}>{tip}</span>);
      if (idx !== tips.length - 1) { tipElements.push(<br key={`tip-br-${idx}`}/>); }
    });

    return (
      <Page className="page-slogin page-operator-login" renderToolbar={this.renderToolbar}>
        <Form
          ref="loginForm"
          onValid={this.enableSubmit.bind(this)}
          onInvalid={this.disableSubmit.bind(this)}
          onValidSubmit={this.startLogin.bind(this)}>
          <List modifier="noborder" className="list__form list-form-login">
            <ListItem>
              <div className="center">
                <span className="form__label">手机号码</span>
                <Input
                  className="form__control"
                  name="username"
                  type="text"
                  required
                  validations="isMobile"
                  validationError="请输入正确的手机号"
                  placeholder="本人手机号码"/>
              </div>
            </ListItem>
            <ListItem>
              <div className="center">
                <Input
                  className="form__control"
                  ref="randomPasswordField"
                  name="randomPassword"
                  type="text"
                  required
                  validations="isAlphanumeric"
                  validationError="请输入短信验证码"
                  placeholder="请输入短信验证码"/>
              </div>
              <div className="right">
                <a
                  className={smsButtonClass}
                  onClick={this.sendSMSCode}
                  href="javascript:;">
                  {smsButtonText}
                </a>
              </div>
            </ListItem>
            <ListItem>
              <div className="center">
                <Input
                  className="form__control"
                  ref="passwordField"
                  name="password"
                  type="password"
                  required
                  validationError="请输入服务密码"
                  placeholder="请输入服务密码" />
              </div>
              <div className="right">
                <a className="button-plain" onClick={this.showResetPassword} href="javascript:;">忘记密码</a>
              </div>
            </ListItem>
            {needsCaptcha &&
              <ListItem>
                <div className="center">
                  <Input
                    className="form__control"
                    ref="captchaField"
                    name="code"
                    type="text"
                    required
                    validations="isAlphanumeric"
                    validationError="请输入正确的验证码"
                    placeholder="请输入验证码"/>
                </div>
                <div className="right form-captcha-container">
                  {store.loginCaptcha ?
                    <img
                      className="form-captcha-image"
                      onClick={this.refreshCaptchaCode.bind(this)}
                      src={store.loginCaptcha}/>
                    :
                    <ProgressCircular indeterminate className="captcha-loading" />
                  }
                </div>
              </ListItem>
            }
          </List>
        </Form>
        <div className="content__block">
          <Button
            modifier="large"
            disabled={this.state.submitDisabled}
            onClick={() => {this.refs.loginForm.submit()}}>登录</Button>
          <div className="login-tip">{tipElements}</div>
        </div>
      </Page>
    );
  }
}

export default withRouter(OperatorLoginPage);
