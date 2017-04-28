import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
import server from 'scripts/config/server';
import UserUtil from 'scripts/utils/user';
import ModalUtil from 'scripts/utils/modal';
import classNames from 'classnames';
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

@inject('settingsStore') @observer
class MySettingsPage extends Component {
  state = {
    alertDialogShown: false,
    alertCacheDialog: false,
    cacheSize: 0,
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
        <div className="center">设置</div>
      </Toolbar>
    );
  }


  logout = () => {
    localStorage.setItem('userId', '');
    localStorage.setItem('token', '');

    if (__IS_APP__) {
      JSBridge.callNative(
        'AppConfig.set',
        {key: 'userId', value: ''}
      );
      JSBridge.callNative(
        'AppConfig.set',
        {key: 'token', value: ''}
      );
      JSBridge.callNative(
        'Controller.logout',
        {}
      );
    }

    this.hideAlertDialog();

    const redirectUrl = `${server.h5root}`;

    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
    } else {
      window.location.replace(redirectUrl);
    }
  }

  hideAlertDialog = () => {
    this.setState({alertDialogShown: false});
    this.setState({alertCacheDialog: false});
  }

  showAlertDialog = () => {
    this.setState({alertDialogShown: true});
  }

  showCacheDialog = () => {
    if (this.state.cacheSize) {
      this.setState({alertCacheDialog: true});
    }
  }

  clearCache = () => {
    if (__IS_APP__) {
      JSBridge.callNative('WebView.clearCache', {});
      ModalUtil.toast('缓存清除成功!');
      this.setState({cacheSize: 0});
      this.hideAlertDialog();
    }
  }

  changeCage = (result) => {
    let cacheSize = result.data.cacheSize;
    this.setState({cacheSize: cacheSize});
  }

  getAppCache = () => {
    if (__IS_APP__) {
      if (!window.JSBridge) {
        document.addEventListener('JSBridgeReady', () => {
          JSBridge.callNative('WebView.getCache', {}, this.changeCage);
        });
      } else {
        JSBridge.callNative('WebView.getCache', {}, this.changeCage);
      }

    }
  }

  componentWillMount() {
    this.getAppCache();
  }


  render() {

    return (
      <Page className="page-settings" renderToolbar={this.renderToolbar}>
        <div className="settings-container">
          <List modifier="noborder">
            <ListItem className="my-settings-item">
              <div className="center">
                当前版本
              </div>
              <div className="right right-word">
                {__APP_VERSION__}
              </div>
            </ListItem>
            <ListItem modifier="chevron tappable" className="my-settings-item" onClick={this.showCacheDialog}>
              <div className="center">
                清除缓存
              </div>
              <div className="right right-word">
                {this.state.cacheSize}
              </div>
            </ListItem>
          </List>
        </div>

        {UserUtil.isLogged() &&
          <Button modifier="large" onClick={this.showAlertDialog} className="user-logout">退出当前账号</Button>
        }

        <AlertDialog
          className="alert-dialog-wechat"
          isOpen={this.state.alertDialogShown}
          isCancelable={false}>
          <div className='alert-dialog-title'>确认退出当前账号吗？</div>
          <div className='alert-dialog-footer alert-mfooter'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              取消
            </button>
            <button onClick={this.logout} className='alert-dialog-button alert-dialog-right'>
              确认退出
            </button>
          </div>
        </AlertDialog>
        <AlertDialog
          className="alert-dialog-wechat"
          isOpen={this.state.alertCacheDialog}
          isCancelable={false}>
          <div className='alert-dialog-title'>确定要清除缓存吗？</div>
          <div className='alert-dialog-footer alert-mfooter'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              取消
            </button>
            <button onClick={this.clearCache} className='alert-dialog-button alert-dialog-right'>
              确定
            </button>
          </div>
        </AlertDialog>
      </Page>
    );
  }
}

export default withRouter(MySettingsPage);
