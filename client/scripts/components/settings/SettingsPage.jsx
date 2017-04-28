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

import 'styles/components/settings/SettingsPage.scss';
import server from 'scripts/config/server';
import UserUtil from 'scripts/utils/user';

@inject("settingsStore") @observer
class SettingsPage extends Component {
  state = {
    isOpen: false,
    alertDialogShown: false
  };

  showAlertDialog = () => {
    this.setState({isOpen: false});
    this.setState({alertDialogShown: true});
  }

  hideAlertDialog = () => {
    this.setState({alertDialogShown: false});
  }

  openWeChat = () => {
    if (__IS_APP__) {
      JSBridge.callNative('App.clipboard', {text: '开薪管家'});
      JSBridge.callNative('App.openUrl', {url: 'weixin://'});
    } else {
      location.href='weixin://';
      window.clipboardData.setData("Text", "开薪管家");
    }

    this.hideAlertDialog();
  }

  componentWillMount() {
    const {settingsStore} = this.props;

    if (UserUtil.isLogged()) {
      settingsStore.fetchUserInfo();
    }
  }

  componentWillReceiveProps() {
    const {settingsStore, isLogin} = this.props;
    if (isLogin && !settingsStore.userMobile) {
      settingsStore.fetchUserInfo();
    }
  }

  toMyLoanListPage = () =>{
    let {router, location, showLoginDialog} = this.props;

    if (!UserUtil.isLogged()) {
      showLoginDialog();
      return;
    }

    let redirectUrl = `${server.h5root}/settings/loanlist${location.search}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '我的贷款',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }

  }

  toMySettings = () =>{
    let {location} = this.props;
    let redirectUrl = `${server.h5root}/settings/mysettings${location.search}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '设置',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  toAboutUs = () => {
    let {location} = this.props;
    let redirectUrl = `${server.h5root}/settings/aboutus${location.search}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.push', {
        type: 'url',
        title: '关于我们',
        url: redirectUrl,
        showNavigationBar: true,
      });
    } else {
      window.location.href = redirectUrl;
    }
  }

  showLogin = () => {
    const {showLoginDialog} = this.props;
    if (!UserUtil.isLogged()) {
      showLoginDialog();
      return;
    }
  }

  render() {
    const {settingsStore, isLogin} = this.props;

    return (
      <Page
        className="page-settings"
        renderModal={() => (<Modal isOpen={this.state.isOpen}>
          <section className="wx-modal">
            <span>
              联系客服
               <span className="service-time">
              服务时间：10:00-20:00
              </span>
            </span>

            <div className="show_bottom" onClick={this.showAlertDialog}>
                <div className="icon_wechat">

                </div>
                <div className="right-word">
                  开薪管家
                  <Icon icon="ion-ios-arrow-right" style={{color: '#c8c8c8',marginLeft:'10px'}}/>
                </div>
            </div>
            <span className="span-cancle"
                  onClick={() => this.setState({isOpen: false})}>取消</span>
          </section>
        </Modal>)}
      >

        <AlertDialog
          isOpen={this.state.alertDialogShown}
          className="alert-dialog-wechat"
          onCancel={this.hideLoginDialog}
          isCancelable={true}>
          <div className='alert-dialog-title'>微信号"开薪管家"已复制到剪切板，是否打开微信？</div>
          <div className='alert-dialog-footer alert-mfooter'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              取消
            </button>
            <button onClick={this.openWeChat} className='alert-dialog-button alert-dialog-right'>
              打开微信
            </button>
          </div>
        </AlertDialog>
        <div className="settings-container">
          <List>
            <ListHeader className="user-info">
              <div className="user-phone"
                   onClick={this.showLogin}>{isLogin ? settingsStore.userMobile : '未登录' }</div>
            </ListHeader>
            <ListItem onClick={this.toMyLoanListPage} style={{marginTop: '20px'}}
                      className="list-item-underline list-item-topline" modifier="chevron">
              <div className="left">
                <label className="icon_loan"></label>
              </div>
              <div className="center">
                我的贷款
              </div>
            </ListItem>

            <ListItem className="list-item-underline" modifier="chevron" onClick={this.toAboutUs}>
              <div className="left">
                <label className="icon_about_us"/>
              </div>
              <div className="center">
                关于我们
              </div>
            </ListItem>

            <ListItem className="list-item-underline" modifier="chevron">
              <div className="left">
                <label className="icon_wechat"/>
              </div>
              <div className="center" onClick={() => this.setState({isOpen: true})}>
                联系客服
              </div>
            </ListItem>
          </List>
          <List>
            <ListHeader></ListHeader>
            <ListItem modifier="chevron">
              <div className="left">
                <label className="icon_settings"/>
              </div>
              <div className="center" onClick={this.toMySettings}>
                设置
              </div>
            </ListItem>
          </List>
        </div>
      </Page>
    );
  }
}

export default withRouter(SettingsPage);
