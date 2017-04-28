import 'styles/components/profile/IdentityImagePage.scss';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import ons from 'onsenui';
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  Button,
  List,
  ListItem,
} from 'react-onsenui';
import BaseContainer from './BaseContainer';
import { Form, Input } from 'scripts/components/form/Form';
import UserUtil from 'scripts/utils/user';
import ModalUtil from 'scripts/utils/modal';
import { FACE_PLUS_PLUS, NAME, IDENTITY } from 'scripts/constants/profileSteps';
import bizLog from 'scripts/adapters/businessLog';
import server from 'scripts/config/server';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  iStore: stores.identityImageStore,
  pStore: stores.profileStore,
}))
@observer
class IdentityImagePage extends BaseContainer {

  static defaultProps = {
    title: '申请贷款(1/4)',
    stepNames: [FACE_PLUS_PLUS, NAME, IDENTITY],
  }

  state = {
    imageDimension: {},
    submitDisabled: true,
    livenessChecked: false,
    frontImageTaken: false,
    backImageTaken: false,
    idInfo: null,
    hasIdInfo: false, //是否已经实名认证完成
  }

  constructor (props) {
    super(props);

    this.timestamp = (new Date()).getTime();
  }

  componentWillMount () {
    this.fetchInitialData();

    const { title } = this.props;
    document.title = title;

    window.onNativeLeftButtonClick = this.onBackButtonClick;
    JSB.callNative('NavBar.setTitle', { title });
    JSB.callNative('NavBar.setLeftItem', {
      url: `${server.h5root}/images/back@2x.png`
    });
  }

  componentDidMount () {
    setTimeout(() => this.calculateImageSize(), 0);
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    window.onNativeLeftButtonClick = () => {
      JSB.callNative('Controller.pop', {});
    };
  }

  async fetchInitialData () {
    const { pStore } = this.props;
    await pStore.fetchCurrentStep();
    let idInfo = await pStore.fetchCertificationInfoRequest();
    if (idInfo.name && idInfo.idNumber) {
      this.setState({ idInfo, hasIdInfo: true });
    }
  }

  //计算身份证照片布局
  calculateImageSize () {
    let container = findDOMNode(this.refs.imageContainer);

    let w = container.offsetWidth - 8 - 15; //容器宽度-padding值-图片间隙
    let r1 = 335 / 200; // 图片宽高比
    let w1 = w / 2;
    let h1 = w1 / r1;

    this.setState({ imageDimension: { w1: w1, h1: h1 }});
  }

  openFacePlusPlus = () => {
    const { livenessChecked } = this.state;
    if (livenessChecked) { return; }

    bizLog.logWithStep('3003');

    JSB.callNative(
      'OpenCamera.open',
      { timestamp : this.timestamp, type: 2 },
      (result) => {
        if (result.code !== 0) {
          ModalUtil.toast(result.errMsg);
          return;
        }

        if (result.code === 0) {
          this.refs.faceDelta.setValue(result.data.delta || '');
          this.setState({ livenessChecked: true });
        } else{
          ModalUtil.toast(result.errMsg);
        }
      }
    );
  }

  openIdentityCamera = (type) => {
    const { iStore } = this.props;
    const { hasIdInfo } = this.props;
    let auth = UserUtil.fetchAuthorization();

    bizLog.logWithStep(type === 0 ? '3004' : '3005');

    JSB.callNative(
      'OpenCamera.open',
      { timestamp : this.timestamp, type },
      async (result) => {
        if (result.code !== 0) {
          ModalUtil.toast(result.errMsg);
          return;
        }

        let path;
        let { backImageTaken, frontImageTaken } = this.state;
        if (type === 0) {
          path = `${auth.userId}/${this.timestamp}/front.jpg`;
          frontImageTaken = true
          this.setState({frontImageTaken});
        } else if (type === 1) {
          path = `${auth.userId}/${this.timestamp}/back.jpg`;
          backImageTaken = true;
          this.setState({backImageTaken: true});
        }

        iStore.fetchIdentityImageThumb(type, path);
        if (frontImageTaken && backImageTaken && !hasIdInfo) {
          let idInfo = await iStore.recognizeIdentityImages(this.timestamp);
          this.setState({ idInfo: { name: idInfo.name, idNumber: idInfo.idNumber } });
        }
      }
    );
  }

  async submitIdentityInfo (data) {
    const { iStore, pStore } = this.props;
    const {
      livenessChecked,
      frontImageTaken,
      backImageTaken,
      hasIdInfo
    } = this.state;

    if (!livenessChecked) {
      ModalUtil.toast('请进行真人认证');
      return;
    }
    if (!(frontImageTaken && backImageTaken)) {
      ModalUtil.toast('请上传身份证照片');
      return;
    }

    try {
      await iStore.recognizeIdentityImages(this.timestamp);
    } catch (err) {
      iStore.resetIdenityImages();
      return;
    }

    bizLog.logWithStep('3007');

    let messageHTML = `
      <div class="idinfo-confirm-container">
        <div class="warning">个人资料一经确认无法修改</div>
        <div class="idinfo-name">${data.name}</div>
        <div class="idinfo-idno">${data.idNumber}</div>
      </div>
    `;

    if (!hasIdInfo) {
      let buttonIndex = await ons.notification.confirm({
        title: '',
        messageHTML,
        buttonLabels: ['我要修改', '确定正确'],
        primaryButtonIndex: 1,
      });

      if (buttonIndex === 0) { return; }
      bizLog.logWithStep('3006');
    }

    try {
      await iStore.submitIdentityInfo(data);
      pStore.fetchCurrentStep();
    } catch(ex) {
      console.log(ex);
    }
  }

  disableSubmit = () => {
    this.setState({ submitDisabled: true });
  }

  enableSubmit = () => {
    this.setState({ submitDisabled: false });
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
    bizLog.logWithStep('3008');
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
    const { iStore } = this.props;
    const { imageDimension, livenessChecked, idInfo, hasIdInfo } = this.state;

    return (
      <Page className="page-profile page-identity-image" renderToolbar={this.renderToolbar}>
        <div className="profile-title">验证个人身份信息</div>
        <Form
          ref="idInfoForm"
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          onValidSubmit={this.submitIdentityInfo.bind(this)}>
          <List modifier="noborder" className="list-info list__form">
            <ListItem
              className={`check-liveness-item ${livenessChecked && 'checked'}`}
              modifier="tappable"
              tappable={true}
              onClick={this.openFacePlusPlus}>
              <div className="center">
                <span className="form__label">真人认证</span>
                <div className="check-liveness-text">{livenessChecked ? '已认证' : '请认证'}</div>
                <div className="check-liveness-status">
                  <Icon icon={livenessChecked ? 'ion-ios-checkmark' : 'ion-chevron-right'} />
                </div>
                <Input ref="faceDelta" type="hidden" value="" name="faceDelta" />
              </div>
            </ListItem>
            <ListItem className="list-item-image">
              <div className="center">
                <div className="form__label">身份信息</div>
                <div ref="imageContainer" className="identity-image-container">
                  <img
                    className="image-front"
                    src={iStore.images.front}
                    onClick={partial(this.openIdentityCamera, 0)}
                    width={`${imageDimension.w1}px`}
                    height={`${imageDimension.h1}px`}/>
                  <img
                    className="image-back disabled"
                    src={iStore.images.back}
                    onClick={partial(this.openIdentityCamera, 1)}
                    width={`${imageDimension.w1}px`}
                    height={`${imageDimension.h1}px`}/>
                </div>
              </div>
            </ListItem>
            <ListItem>
              <div className="center">
                <span className="form__label">本人姓名</span>
                <Input
                  className="form__control"
                  type="text"
                  name="name"
                  value={idInfo ? idInfo.name : ''}
                  validationError="请输入本人姓名"
                  readOnly={hasIdInfo || !idInfo}
                  required
                  placeholder="请输入姓名"/>
              </div>
            </ListItem>
            <ListItem>
              <div className="center">
                <span className="form__label">身份证号</span>
                <Input
                  className="form__control text-input"
                  type="text"
                  name="idNumber"
                  value={idInfo ? idInfo.idNumber : ''}
                  validations="isIdentity"
                  validationError="请输入正确的身份证号码"
                  maxLength="18"
                  readOnly={hasIdInfo || !idInfo}
                  required
                  placeholder="请输入身份证号"/>
              </div>
            </ListItem>
          </List>
          <div className="action-container">
            <Input
              ref="timestamp"
              type="hidden"
              value={String(this.timestamp)}
              name="timestamp"
              required />
            <Button
              modifier="large"
              onClick={() => {
                this.refs.idInfoForm.submit();
              }}
              disabled={this.state.submitDisabled}>
              下一步
            </Button>
          </div>
        </Form>
      </Page>
    );
  }
}

export default withRouter(IdentityImagePage);

