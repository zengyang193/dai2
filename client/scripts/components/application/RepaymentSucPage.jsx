import 'styles/components/application/SucResultPage.scss';

import React, {Component} from 'react';
import {withRouter} from 'react-router';
import queryString from 'query-string';

import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  Icon,
} from 'react-onsenui';
import ProgressCircular from 'scripts/components/ProgressCircular';

class RepaymentSucPage extends Component {

  state = {
    amount: 0
  };

  constructor (props) {
    super(props);

    const { location } = props;
    this.query = queryString.parse(location.search);
  }

  componentWillMount() {
    const {location} = this.props;
    const query = this.query;
    if (query.amount) {
      this.setState({amount: query.amount});
    }
  }

  renderToolbar = () => {
    if (__IS_APP__) { return null; }

    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton>
            <Icon icon='ion-ios-arrow-left'/>
          </ToolbarButton>
        </div>
        <div className="center">还款结果</div>
      </Toolbar>
    );
  }

  goNext = () => {
    const {history} = this.props;
    history.goBack();
  }

  render() {
    return (
      <Page className="page-application page-bind-bankcard" renderToolbar={this.renderToolbar}>
        <div className="suc-result-page">
          <div className="suc-img-container">
            <Icon icon="ion-checkmark-round" className="checkmark-suc"/>
            <label className="suc-word">成功还款</label>
          </div>
          <ProgressCircular value={20} className="imge-suc"/>

          <div className="repayment-word">成功还款：<label className="repayment-amount">￥{this.state.amount}</label></div>
          <Button modifier="large" onClick={this.goNext} className="suc-next">下一步</Button>
        </div>
      </Page>)
  }
}

export default withRouter(RepaymentSucPage);


