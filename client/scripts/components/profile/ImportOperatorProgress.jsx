import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import assign from 'lodash/assign';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Button,
  Icon,
} from 'react-onsenui';
import {
  STATUS_INITIALIZED,
  STATUS_PROCESSING,
  STATUS_PENDING,
  STATUS_FAILURE,
  STATUS_SUCCESS,
} from 'scripts/constants/importStatusEnum';
import ProgressCircular from 'scripts/components/ProgressCircular';
import server from 'scripts/config/server';
import { appendParamsToQueryString } from 'scripts/utils/url';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ImportOperatorProgress extends Component {

  static defaultProps = {
    title: '运营商认证',
  };

  state = {
    progress: 0,
    statusText: '正在验证运营商',
    detailText: null,
    statusTip: null,
    randomTip: null,
    mockTime: 134,  // 如在此时间内未完成导入，进度停留在90%
    elapsedTime: 0  // 当前耗时
  };

  timer = null;

  componentWillReceiveProps (props) {
    this.handleNewProps(props);
  }

  componentDidMount () {
    this.handleNewProps(this.props);
    //this.pickRandomTip();
  }

  handleNewProps (props) {
    const {
      pStore,
      importStatus,
      statusTip,
    } = props;
    let newState = { importStatus, statusTip };

    switch (importStatus) {
      case STATUS_PROCESSING:
        this.startProcessing();
        break;
      case STATUS_PENDING:
        this.stopProcessing();
        break;
      case STATUS_SUCCESS:
        this.stopProcessing();
        assign(newState, { progress: 100, statusText: '验证运营商成功' });
        break;
      case STATUS_FAILURE:
        this.stopProcessing();
        assign(newState, { progress: 0, statusText: '验证运营商失败' });
        break;
    }

    this.setState(newState);
  }

  startProcessing () {
    const { mockTime } = this.state;
    let timeStep = 1, progressStep = 90 / mockTime / timeStep;

    if (this.timer) { return; }

    this.timer = setInterval(() => {
      const { elapsedTime, mockTime, progress } = this.state;
      if (elapsedTime < mockTime) {
        let newElapsedTime = elapsedTime + timeStep;
        let remainTime = mockTime - newElapsedTime;

        //如果倒计时结束导入仍未完成，显示剩余时间为1S
        if (remainTime <= 0) { remainTime = 1; }

        this.setState({
          elapsedTime: newElapsedTime,
          progress: progress + progressStep,
          detailText: `剩余时间${remainTime}s`
        });
      } else {
        this.stopProcessing();
        this.setState({
          elapsedTime: mockTime,
          detailText: `剩余时间1s`
        });
      }
    }, timeStep * 1000);
  }

  stopProcessing () {
    clearInterval(this.timer);
    this.timer = null;
  }

  pickRandomTip (tips) {
    if (!tips || tips.length === 0) {
      tips = [
        '运营商验证是为了有助于加快放款速度，大树金融将保障数据安全。',
        '根据大树大数据显示，平均20s就能完成运营商验证哦～',
        '请牢记手机服务密码，以便查询通话账单和丢失手机时紧急处理哦～',
        '手机服务密码是你的号码在移动运营公司进行获取服务时需要提供的一个身份凭证。',
        '功夫贷官方客服电话：4001588012'
      ];
    }

    let r = (Math.random() * 100).toFixed(0) % tips.length;
    let picked = tips.splice(r, 1);
    this.setState({ randomTip: picked });

    this.pickTipTimer = setTimeout(() => {
      this.pickRandomTip(tips);
    }, 3000);
  }

  onBackButtonClick = () => {
    const { importStatus, navigator } = this.props;

    if (importStatus === STATUS_FAILURE) {
      navigator.popPage();
    } else {
      const redirectUrl = `${server.h5root}`;
      if (__IS_APP__) {
        JSBridge.callNative('Controller.pop', {});
      } else {
        window.location.replace(redirectUrl);
      }
    }
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

  render () {
    const { pStore, importStatus } = this.props;
    const {
      progress,
      statusText,
      statusTip,
      detailText,
    } = this.state;

    let progressDetailElement = null;

    switch (importStatus) {
      case STATUS_SUCCESS:
        progressDetailElement = (
          <div className="progress-detail">
            <div className="progress-result-icon">
              <Icon icon="ion-checkmark"></Icon>
            </div>
          </div>
        );
        break;
      case STATUS_FAILURE:
        progressDetailElement = (
          <div className="progress-detail">
            <div className="progress-result-icon">
              <Icon icon="ion-alert"></Icon>
            </div>
          </div>
        );
        break;
      case STATUS_PROCESSING:
      case STATUS_PENDING:
        progressDetailElement = (
          <div className="progress-detail">
            <div className="progress-text">
              <span className="progress-percent-value">{parseInt(progress)}</span>
              <span className="progress-percent-sign">%</span>
            </div>
            <div className="progress-time">{detailText}</div>
          </div>
        );
        break;
    }

    return (
      <Page
        className="page-profile page-import-operator page-import-progress"
        renderToolbar={this.renderToolbar}>
        <div className="import-progress-container">
          <ProgressCircular modifier="determinate" value={progress} />
          {progressDetailElement}
        </div>
        <div className="status-text">{statusText}</div>
        <div className="status-tip">{statusTip}</div>
      </Page>
    );
  }
}

export default withRouter(ImportOperatorProgress);
