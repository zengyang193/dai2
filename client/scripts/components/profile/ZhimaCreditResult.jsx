import 'styles/components/profile/ZhimaCreditPage.scss';

import React, { Component } from 'react';
import ons from 'onsenui';
import queryString from 'query-string';
import {
  Page,
  Toolbar,
  ToolbarButton,
  List,
  ListItem,
  Button,
  Icon,
} from 'react-onsenui';

import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import UserUtil from 'scripts/utils/user';

class ZhimaCreditResult extends Component {
  static defaultProps = { title: '芝麻信用授权' };

  constructor (props) {
    super(props);
    const { location } = props;

    this.state = {
      result: null //success: 授权成功, failure:授权失败
    };
    this.query = queryString.parse(location.search);
  }

  componentWillMount () {
    this.fetchInitialData();
  }

  async fetchInitialData () {
    const {
      params = null,
      success = 0,
      sign = null
    } = this.query;
    const auth = UserUtil.fetchAuthorization();

    let redirectUrl = `${server.h5root}/profile/zmxy?userId=${auth.userId}&token=${auth.token}`;

    if (sign && params) {
      try {
        let data = await request.post(
          `${server.gateway}/zmxy/callback`,
          { params, sign },
          { showError: false }
        );
        this.setState({ result: 'success' });
        setTimeout(() => {
          if (__IS_APP__) {
            JSBridge.callNative('Controller.pop', {});
          } else {
            window.location.href = redirectUrl;
          }
        }, 4000);
      } catch (err) {
        console.log(err);
        this.setState({ result: 'failure' });
        await ons.notification.alert({
          title: '提示',
          message: err.data.errorMsg,
        });

        if (__IS_APP__) {
          JSBridge.callNative('Controller.pop', {});
        } else {
          window.location.href = redirectUrl;
        }
      }
    } else {
      this.setState({result:Number(success) ? 'success' : 'failure'});

      setTimeout(() => {
        if (__IS_APP__) {
          JSBridge.callNative('Controller.pop', {});
        } else {
          window.location.href = redirectUrl;
        }
      }, 4000);
    }
  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    if (__IS_APP__) {
      JSBridge.callNative('Controller.pop', {});
    } else {
      window.location.replace(redirectUrl);
    }
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton onClikc={this.onBackButtonClick}>
            <Icon icon='ion-ios-arrow-left' />
          </ToolbarButton>
        </div>
        <div className="center">{this.props.title}</div>
        <div className="right">
          <ToolbarButton>
            <Icon icon='ion-ios-help-outline' />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render () {
    const { result } = this.state;

    return (
      <Page className="page-zhima-credit" renderToolbar={this.renderToolbar}>
        <div className="content__block">
          <div className="auth-success-container">
            <div className={`indicator ${ result !== 'success' && 'failure'}`}>
              {result === 'success' ?
                <Icon icon="ion-ios-checkmark-outline" />
                  :
                <Icon icon="ion-ios-close-outline" />
              }
            </div>
            {result &&
              <div className="message">
                {result === 'success' ? '芝麻信用授权成功，马上返回' : '芝麻信用授权失败，请重试'}
              </div>
            }
          </div>
        </div>
      </Page>
    );
  }
}

export default ZhimaCreditResult;

