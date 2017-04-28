import React, { Component } from 'react';
import { Button, Dialog } from 'react-onsenui';
import { Form, Input } from 'scripts/components/form/Form';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';
import server from "scripts/config/server"
import bizLog from 'scripts/adapters/businessLog';

import 'styles/components/home/LoginDialog.scss';

@inject((stores) =>({
  homeStore: stores.homeStore,
  userStore: stores.userStore,
}))
@observer
class LoginDialog extends Component {
  state = {
    smsTimeout: 0,
    submitDisabled: true,
    sendCodeDisabled: true,
  };

  enableSubmit = () => {
    this.setState({ submitDisabled: false });
    this.checkSendCodeStatus();
  }

  disableSubmit = () => {
    this.setState({ submitDisabled: true });
    this.checkSendCodeStatus();
  }

  async loginPDL () {
    bizLog.logWithStep('1003');
    const {userStore, onLogin} = this.props;
    let formData = this.refs.loginForm.getModel();
    try {
      await userStore.login(formData.mobile, formData.code);
      localStorage.setItem('userId', userStore.authorization.userId);
      localStorage.setItem('token', userStore.authorization.token);
      onLogin();
      if (__IS_APP__) {
        JSBridge.callNative(
          'AppConfig.set',
          {key: 'userId', value: userStore.authorization.userId}
        );
        JSBridge.callNative(
          'AppConfig.set',
          {key: 'token', value: userStore.authorization.token}
        );
      }

      bizLog.logWithStep('1004');
    } catch (ex) {
      console.error(ex);
    }
  }

  sendSMSCode = () => {
    bizLog.logWithStep('1002');

    if(this.state.sendCodeDisabled) return;


    const { userStore } = this.props;
    let formData = this.refs.loginForm.getModel();

    let mobile = formData.mobile;

    this.setState({smsTimeout: 60, sendCodeDisabled: true});
    this.smsInterval = setInterval(() => {
      let nextTick = this.state.smsTimeout - 1;
      this.setState({smsTimeout: nextTick});
      if (nextTick === 0) {
        clearInterval(this.smsInterval);
        this.setState({sendCodeDisabled: false});
      }
    }, 1000);
    userStore.sendSmsCode(mobile);
  }

  checkSendCodeStatus  = () => {
    const { smsTimeout } = this.state;
    if (this.refs.mobile.isValid() && smsTimeout === 0) {
      this.setState({ sendCodeDisabled: false });
    } else {
      this.setState({ sendCodeDisabled: true });
    }
  }

  toUserService = ()=>{
    let redirectUrl = `${server.h5root}/agreement/user_service`;

    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '用户协议',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  render () {
    let smsTimeout = this.state.smsTimeout;
    let smsButtonClass = classNames({
      'button-login': true,
      'send-code': true,
      'button-disabled': this.state.sendCodeDisabled,
    });
    let smsButtonText = smsTimeout ? `${smsTimeout}S` : '获取验证码';

    let buttonClass = classNames({
      'button-login': true,
      'button-disabled': this.state.submitDisabled
    });


    return (

      <Dialog {...this.props}>
        <Form
          ref="loginForm"
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          onValidSubmit={this.loginPDL.bind(this)}>
          <div style={{textAlign: 'center', margin: '20px'}}>
            <div className="login-title">快速登录</div>
            <Input
              maxlength="11"
              ref="mobile"
              type="number"
              value=""
              placeholder="请输入手机号"
              name="mobile"
              maxLength="11"
              required
              validations="isMobile"
              validationError="请输入正确的手机号"
              className="input-login"/>
            <div className="sendcode-div">
              <Input
                ref="smsCode"
                type="number"
                name="code"
                value=""
                required
                placeholder="请输入验证码"
                validations="isAlphanumeric"
                validationError="请输入正确的验证码"
                className="input-login"/>
              <Button onClick={this.sendSMSCode} className={smsButtonClass} disabled={this.state.sendCodeDisabled}> {smsButtonText}</Button>
            </div>
            <Button onClick={() => this.refs.loginForm.submit()} modifier='large' className={buttonClass} disabled={this.state.submitDisabled}>登录</Button>
            <p className="login-agreement">点击登录即同意<a onClick={this.toUserService}>《用户服务协议》</a></p>
          </div>
        </Form>
      </Dialog>
    );
  }
}

export default LoginDialog;
