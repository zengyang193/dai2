import 'styles/components/MainPage.scss';

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import {Page, Tabbar, Toolbar, Tab, Button} from 'react-onsenui';
import ons from 'onsenui';

import server from 'scripts/config/server';
import HomePage from 'scripts/components/home/HomePage';
import SettingsPage from 'scripts/components/settings/SettingsPage';
import LoginDialog from 'scripts/components/home/LoginDialog';
import UserUtil from 'scripts/utils/user';
import JSB from 'scripts/adapters/jsbridge';

@inject('homeStore') @observer
class MainPage extends Component {
  constructor (props) {
    super(props);

    const { match } = props;
    this.state = {
      index: match.url === '/settings' ? 1 : 0,
      submitDisabled: true,
      showLogin: false,
      isLogged: UserUtil.isLogged(),
    };
  }

  componentDidMount () {
    this.checkLoginStatus();
  }

  componentWillMount () {
    JSB.registerJSEventHandler('viewappear', this.componentDidAppear);
  }

  componentWillUnmount () {
    JSB.removeJSEventHandler('viewappear', this.componentDidAppear);
  }

  componentDidAppear = () => {
    this.checkLoginStatus();
  }

  async checkLoginStatus () {
    let auth = UserUtil.fetchAuthorization();
    let isLogged = !!(auth.userId && auth.token);

    if (__IS_APP__) {
      if (isLogged) {
        JSB.callNative('AppConfig.set', {key: 'userId', value: auth.userId});
        JSB.callNative('AppConfig.set', {key: 'token', value: auth.token});
      } else {
        auth = await UserUtil.fetchAuthorizationFromNative();
        isLogged = !!(auth.userId && auth.token);
        if (isLogged) {
          localStorage.setItem('userId', auth.userId);
          localStorage.setItem('token', auth.token);
        }
      }
    }
    this.setState({ isLogged });
  }

  showLoginDialog = () => {
    this.setState({ showLogin: true });
  }

  hideLoginDialog = () => {
    this.setState({ showLogin: false });
  }

  renderTabs = () => {
    const { isLogged } = this.state;

    return [{
      content: (
        <HomePage
          key='content-home'
          title='开薪贷'
          showLoginDialog={this.showLoginDialog}
          isLogged={isLogged} />
      ),
      tab: <Tab key='tab-home' label='首页' icon='md-home' />
    }, {
      content: (
        <SettingsPage
          key='content-settings'
          title='我的'
          showLoginDialog={this.showLoginDialog}
          isLogin={this.state.isLogged}/>
      ),
      tab: <Tab key='tab-settings' label='我的' icon='ion-person' />
    }];
  }

  onTabPreChange = (evt) => {
    const {history, location} = this.props;
    console.log(evt,location,'zgeeeeeeeeeeeeeeeeeee')
    if (evt.index !== this.state.index) {
      let path = evt.index === 0 ? '/' : '/settings';
      this.setState({ index: evt.index });
      history.replace({
        pathname: path,
        search: location.search,
      });
    }
  }

  onLogin = () => {
    this.setState({showLogin: false});
    this.setState({isLogged: true});
  }

  render () {
    return (
      <Page>
        <Tabbar
          className={`${__IS_APP__ && (__OS_FAMILY__ === 'ios') && 'tab-bar-ios'}`}
          index={this.state.index}
          onPreChange={this.onTabPreChange}
          renderTabs={this.renderTabs} />
        <LoginDialog
          isOpen={this.state.showLogin}
          isCancelable={true}
          onCancel={this.hideLoginDialog}
          onLogin={this.onLogin}/>
      </Page>
    );
  }
}

export default withRouter(MainPage);
