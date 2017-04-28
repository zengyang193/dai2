import React, {Component} from 'react';
import {withRouter} from 'react-router';
import 'styles/components/application/SucResultPage.scss';
import server from 'scripts/config/server';
import JSB from 'scripts/adapters/jsbridge';

import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  Icon,
} from 'react-onsenui';
import ProgressCircular from 'scripts/components/ProgressCircular';

class SucResultPage extends Component {


  componentWillMount() {

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
  }

  render() {
    let {next} = this.props;

    if(!next){
      next = this.onBackButtonClick;
    }

    return (
      <div className="page-import-progress">
        <div className="import-progress-container">
          <ProgressCircular value={100} />
          <div className="progress-detail">
            <div className="progress-text">
              <Icon icon="ion-checkmark"></Icon>
            </div>
            <div className="progress-time">申请成功</div>
          </div>
        </div>
        <div className="status-text">审核结果将以系统通知和短信的方式告知您，请注意查收</div>

        <div className="action-container">
          <Button modifier="large" onClick={next}>确定</Button>
        </div>

      </div>
    );
  }
}

export default withRouter(SucResultPage);


