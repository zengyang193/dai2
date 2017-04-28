import 'styles/components/profile/JobInfoPage.scss';

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';
import partial from 'lodash/partial';
import {
  Page,
  Toolbar,
  ToolbarButton,
  List,
  ListItem,
  Button,
  Icon,
} from 'react-onsenui';
import BaseContainer from './BaseContainer';
import { Form, Input, Select } from 'scripts/components/form/Form';
import server from 'scripts/config/server';
import bizLog from 'scripts/adapters/businessLog';
import ModalUtil from 'scripts/utils/modal';
import { CONTACTS_LIST, URGENT_CONTACT, } from 'scripts/constants/profileSteps';
import JSB from 'scripts/adapters/jsbridge';

@inject((stores) => ({
  pStore: stores.profileStore,
}))
@observer
class ImportOperatorPage extends BaseContainer {

  static defaultProps = {
    title: '申请贷款(2/4)',
    stepNames: [CONTACTS_LIST, URGENT_CONTACT],
  }

  state = {
    industryOptions: [],
    maritalOptions: [],
    showCompanyFields: false,
    contact: null,
  };

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

  componentWillUnmount () {
    super.componentWillUnmount();

    window.onNativeLeftButtonClick = () => {
      JSB.callNative('Controller.pop', {});
    };
  }

  onStatusChanged (status) {
    super.onStatusChanged(status);

    const { pStore } = this.props;
    let step = pStore.currentStep;
    let statusCode = status.status;

    if (statusCode === 5 && step === CONTACTS_LIST) {
      ModalUtil.hidePreloader();
      pStore.fetchCurrentStep();
    }
  }

  async fetchInitialData () {
    const { pStore, stepNames } = this.props;

    let step = await pStore.fetchCurrentStep();
    if (stepNames.indexOf(step) !== -1) {
      this.initializeFormOptions();
    }
  }

  async initializeFormOptions () {
    const { pStore } = this.props;
    let options = await pStore.fetchJobInfoOptions();
    let industryOptions = options['COMPANY_INDUSTRY'].map((item) => {
      let { enumCode: value, enumName: label } = item;
      return { value, label };
    }).concat([
      { value: 'student', label: '学生', },
      { value: 'freelance', label: '自由职业', },
    ]);
    industryOptions.unshift({ value: '', label: '请选择职业' });
    // 婚姻状态
    const maritalOptions = options['MARRIAGE_STATUS'].map((item) => {
      let {enumCode: value, enumName: label} = item;
      return {value, label};
    });
    this.setState({industryOptions, maritalOptions});
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
    bizLog.logWithStep('4004');
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

  disableSubmit = () => {
    this.setState({ submitDisabled: true });
  }

  enableSubmit = () => {
    this.setState({ submitDisabled: false });
  }

  async submitJobInfo (data) {
    bizLog.logWithStep('4003');

    const { pStore } = this.props;
    const { contact } = this.state;

    if (['student', 'freelance'].indexOf(data.companyIndustry) !== -1) {
      data.employmentType = data.companyIndustry;
      data.companyIndustry = '';
    } else {
      data.employmentType = 'employed';
    }

    ModalUtil.showPreloader();
    try {
      await pStore.submitJobInfo(data);
      await pStore.submitContactInfo(contact);

      pStore.setCurrentStep(CONTACTS_LIST);
      const contactListStatusHandler = async () => {
        try {
          let result = await pStore.fetchStepStatus(CONTACTS_LIST, false);
          let status = result[CONTACTS_LIST];
          let statusCode = status.status;
          if (statusCode === -1 || statusCode === 0 || statusCode === 1) {
            setTimeout(() => contactListStatusHandler(), 3000);
          }
        } catch (err) {
          ModalUtil.hidePreloader();
        }
      }
      contactListStatusHandler();
    } catch (err) {
      ModalUtil.hidePreloader();
    }
  }

  openAddressBook = () => {
    bizLog.logWithStep('4002');
    JSB.callNative('OpenAddressBook.open', {}, (result) => {
      if (result.code !== 0) {
        ModalUtil.toast(result.errMsg);
        return;
      }

      let contact = result.data
      this.setState({
        contact: {
          name: contact.name,
          mobile: contact.mobile.replace(/\D+/g, '')
        }
      });
    });
  }

  onIndustryChange = (e) => {
    let value = e.target.value;
    if (value === '' || value === 'student' || value === 'freelance') {
      this.setState({showCompanyFields: false});
    } else {
      this.setState({showCompanyFields: true});
    }
    bizLog.logWithStep('4001');
  }

  render () {
    const { pStore } = this.props;
    const { industryOptions, showCompanyFields, contact, maritalOptions} = this.state;

    return (
      <Page className="page-profile page-job-info" renderToolbar={this.renderToolbar}>
        <div className="profile-title">填写基本个人资料</div>
        <Form
          ref="jobInfoForm"
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          onValidSubmit={this.submitJobInfo.bind(this)}>
          <List className="list-info list__form">
            <ListItem modifier="chevron">
              <div className="center">
                <span className="form__label">职业信息</span>
                <Select
                  className="form__control"
                  name="companyIndustry"
                  onChange={this.onIndustryChange}
                  options={industryOptions}
                  required
                  placeholder="请选择职业"/>
              </div>
            </ListItem>
            {showCompanyFields &&
              <ListItem>
                <div className="center">
                  <span className="form__label">公司名称</span>
                  <Input
                    className="form__control"
                    type="text"
                    name="companyName"
                    value=""
                    validationError="请输入公司名称"
                    maxLength="20"
                    required
                    placeholder="填写公司名称"/>
                </div>
              </ListItem>
            }
            {showCompanyFields &&
              <ListItem>
                <div className="center">
                  <span className="form__label">公司电话</span>
                  <Input
                    className="form__control"
                    type="text"
                    name="companyTel"
                    value=""
                    validationError="请输入公司电话"
                    maxLength="20"
                    required
                    placeholder="填写公司电话"/>
                </div>
              </ListItem>
            }
          </List>
          <List className="list-info list__form" >
            <ListItem modifier="chevron">
              <div className="center">
                <span className="form__label">婚姻状态</span>
                <Select
                  className="form__control"
                  name="marriageStatus"
                  options={maritalOptions}
                  value = 'unmarried'
                  required
                  placeholder="请选择"/>
              </div>
            </ListItem>
          </List>
          <List className="list-info list__form" onClick={this.openAddressBook}>
            <ListItem modifier="chevron">
              <div className="center">
                <span className="form__label">紧急联系人</span>
                <Input
                  className="form__control"
                  type="text"
                  name="contact"
                  value={contact ? `${contact.name} ${contact.mobile}` : ''}
                  required
                  readOnly
                  placeholder="请选择"/>
              </div>
            </ListItem>
          </List>
          <div className="action-container">
            <Button
              modifier="large"
              onClick={() => this.refs.jobInfoForm.submit()}
              disabled={this.state.submitDisabled}>
              下一步
            </Button>
          </div>
        </Form>
      </Page>
    );
  }
}

export default withRouter(ImportOperatorPage);
