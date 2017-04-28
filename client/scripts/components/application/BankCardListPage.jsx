import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {observer, inject} from 'mobx-react';
import partial from 'lodash/partial';
import 'styles/components/application/BindBankCardPage.scss';
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
  ListHeader
} from 'react-onsenui';

@inject('applicationStore') @observer
class BankCardListPage extends Component {

  state = {
    isSelectModalOpen: false,
    bankCardSelector: {
      list: []
    }
  }

  static defaultProps = {
    title: '选择银行卡'
  }

  componentWillMount() {
    const {applicationStore} = this.props;

    applicationStore.fetchSupportBanklist();
  }

  onBackButtonClick = () => {
    const {history} = this.props;
    history.goBack();
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
        <div className="center">{this.props.title}</div>
      </Toolbar>
    );
  }

  onBankRowClick = (op, evt) => {
    const {applicationStore, history} = this.props;
    applicationStore.selectBankCard = op;
    history.goBack();
  }

  renderOperatorListRow = (row, idx) => {

    return (
      <ListItem
        key={idx}
        modifier="chevron tappable"
        onClick={partial(this.onBankRowClick, row)}
        tappable={true}>
        <div className="left">
          <div className="bankcardimg">
          <Icon className={`ico-bank-lg bk-logo-${row.id}`}/>
          </div>
        </div>
        <div className="center">
          {row.bankName}
        </div>
      </ListItem>
    );
  }

  render() {
    const {applicationStore} = this.props;
    return (
      <Page className="page-application page-bind-bankcard" renderToolbar={this.renderToolbar}>
        <List
          modifier="noborder"
          renderRow={this.renderOperatorListRow}
          dataSource={applicationStore.supportBankList.slice()}
        />
        <div className="select-card-tip">目前只支持以上银行</div>
      </Page>
    );
  }
}

export default withRouter(BankCardListPage);


