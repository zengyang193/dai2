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
class AboutUsPage extends Component {
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
        <div className="center">关于我们</div>
      </Toolbar>
    );
  }


  logout = () => {

  }

  componentWillMount() {
  }


  render() {

    return (
      <Page className="page-settings"
            renderToolbar={this.renderToolbar}
      >

        <div className="settings-container" style={{backgroundColor: '#fff'}}>
         <div style={{textAlign:'center'}}> <div className="bg_about_us"></div></div>
          <div style={{textAlign:'center'}}><div className="bg_about_us_word"></div></div>
          <div className="about_us_copyright">大树金融旗下贷款App</div>
        </div>

      </Page>
    )
      ;
  }
}

export default withRouter(AboutUsPage);
