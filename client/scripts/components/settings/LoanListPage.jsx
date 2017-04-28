import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
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
class LoanListPage extends Component {
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
        <div className="center">我的借款</div>
      </Toolbar>
    );
  }


  componentWillMount() {
    const {settingsStore} = this.props;

    settingsStore.fetchMyLoanList();
  }


  /**
   *
   * @param num 数值(Number或者String)
   * @param cent  要保留的小数位(Number)
   * @param isThousand  isThousand 是否需要千分位 0:不需要,1:需要(数值类型);
   * @returns {*}
   */
  formatNumber = (num, cent, isThousand) => {
    if (!num) {
      return "0";
    }
    num = num.toString().replace(/\$|\,/g, '');
    // 检查传入数值为数值类型
    if (isNaN(num))
      num = "0";
    // 获取符号(正/负数)
    let sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * Math.pow(10, cent) + 0.50000000001);  // 把指定的小数位先转换成整数.多余的小数位四舍五入
    let cents = num % Math.pow(10, cent);              // 求出小数位数值
    num = Math.floor(num / Math.pow(10, cent)).toString();   // 求出整数位数值
    cents = cents.toString();               // 把小数位转换成字符串,以便求小数位长度
    // 补足小数位到指定的位数
    while (cents.length < cent)
      cents = "0" + cents;
    if (isThousand) {
      // 对整数部分进行千分位格式化.
      for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }

    if (cent > 0)
      return (((sign) ? '' : '-') + num + '.' + cents);
    else
      return (((sign) ? '' : '-') + num);
  }

  renderOperatorListRow = (row, idx) => {
    let loanStatusClass = classNames({
      "right": true,
      "loan-ing": row.inProcess == 1,
      "loan-finish": row.inProcess != 1
    });

    let formatAmount = this.formatNumber(row.applyAmount, 0, 1);
    let applyTime = "";

    if (row.applyTime) {
      applyTime = row.applyTime.replace(/-/g, "/").substring(0, 10);
    }

    return (
      <ListItem
        className="loan-item"
        key={idx}
        tappable={true}>
        <div className="center">
          <div className="list__item__title loan-amount">
            ￥{formatAmount}
          </div>
          <div className="list__item__subtitle loan-time">
            {applyTime}
          </div>
        </div>
        <div className={loanStatusClass}>
          {row.inProcess == 1 ? '进行中' : '已结束'}
        </div>
      </ListItem>
    );
  }

  render() {
    const {settingsStore} = this.props;

    let content = null;

    if (settingsStore.loanList) {
      if (settingsStore.loanList.length > 0) {
        content = ( <List
          modifier="noborder"
          renderRow={this.renderOperatorListRow}
          dataSource={settingsStore.loanList.slice()}
        />);
      } else {
        content = (<div className="empty-content">暂无贷款记录</div>);
      }

    }
    return (
      <Page className="page-settings"
            renderToolbar={this.renderToolbar}
      >

        <div className="settings-container">
          {content}
        </div>
      </Page>
    )

  }
}

export default withRouter(LoanListPage);
