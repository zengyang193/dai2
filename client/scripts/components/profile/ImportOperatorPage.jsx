import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  List,
  ListItem,
  Input,
  Icon,
  Modal,
  Navigator,
} from 'react-onsenui';
import BaseContainer from './BaseContainer';
import ActionSheet from 'scripts/components/actionsheet';
import ProgressPage from 'scripts/components/profile/ImportOperatorProgress';
import server from 'scripts/config/server';
import bizLog from 'scripts/adapters/businessLog';
import { appendParamsToQueryString } from 'scripts/utils/url';
import { OPERATOR } from 'scripts/constants/profileSteps';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ImportOperatorPage extends Component {

  static defaultProps = {
    title: '申请贷款(4/4)',
    stepName: OPERATOR,
  }

  state = {
    isSelectModalOpen: false,
    selectedOperator: {
      list: []
    }
  }

  showLoginPage (config, type) {
    config.startUrl = config.startUrl.map(url => {
      if (url.indexOf(server.h5root) === 0) {
        return appendParamsToQueryString(
          url,
          { title: config.title, }
        );
      } else {
        return url;
      }
    });

    switch(type) {
      case 'cmcc':
        bizLog.logWithStep('6001');
        break;
      case 'unicom':
        bizLog.logWithStep('6002');
        break;
      case 'telcomm':
        bizLog.logWithStep('6003');
        break;
    }

    setTimeout(() => {
      if (__IS_APP__) {
        JSB.callNative('OpenWebView.open', config);
      } else {
        let redirectUrl = config.startUrl[0];
        let isSimulateLogin = redirectUrl.indexOf(server.h5root) === 0;
        if (isSimulateLogin) {
          window.location.href = redirectUrl;
        } else {
          ons.notification.alert({
            title: '提示',
            message: '暂不支持该运营商数据导入',
            buttonLabels: '确定',
          });
        }
      }
    }, 300);
  }

  onOperatorRowClick = (op, evt) => {
    if (op.list.length === 1) {
      setTimeout(() => this.showLoginPage(op.list[0], op.id), 300);
    } else {
      this.setState({ selectedOperator: op, isOperatorSheetShow: true });
    }
  }

  onBackButtonClick = () => {
    const redirectUrl = `${server.h5root}`;
    setTimeout(() => {
      if (__IS_APP__) {
        JSB.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }, 300);
    bizLog.logWithStep('6004');
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

  renderOperatorListRow = (row, idx) => {
    const { pStore, stepName } = this.props;
    const config = pStore.config[stepName];
    return (
      <ListItem
        modifier="chevron tappable"
        tappable={true}
        key={`operator-${idx}`}
        onClick={partial(this.onOperatorRowClick, row)}>
        <div className="center">
          <img className="operator-image" src={row.image} />
        </div>
        <div className="right">{config.importNum[row.id] || 0}人选择</div>
      </ListItem>
    );
  }

  render () {
    const { pStore, stepName } = this.props;
    const config = pStore.config[stepName];
    const { selectedOperator, isOperatorSheetShow } = this.state;
    let operatorList = config.list.slice();
    let operatorSheet = selectedOperator.list.map((item) =>{
      return {
        content: item.title,
        onClick: () => {
          this.setState({ isOperatorSheetShow: false });
          this.showLoginPage(item, selectedOperator.id);
        }
      };
    });

    return (
      <Page className="page-profile page-import-operator" renderToolbar={this.renderToolbar}>
        <div className="profile-title">验证手机号码运营商</div>
        <List
          modifier="noborder"
          className="list-operator"
          renderRow={this.renderOperatorListRow}
          dataSource={operatorList}
        />
        <ActionSheet
          show={isOperatorSheetShow}
          menus={operatorSheet}
          onCancel={() => this.setState({isOperatorSheetShow: false})}
        />
      </Page>
    );
  }
}

export default withRouter(ImportOperatorPage);
