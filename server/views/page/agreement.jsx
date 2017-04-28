'use strict';

import React, { Component } from 'react';
import DefaultLayout from '../layout/default';

class AgreementPage extends Component {
  render () {
    let props = this.props;
    let __assets = this.props.__assets
    let stylesheets = [ __assets.agreement.css ];
    let scripts = [  __assets.agreement.js ];

    return (
      <DefaultLayout {...props} stylesheets={stylesheets} scripts={scripts}>
        <div id="app"></div>
      </DefaultLayout>
    );
  }
}

export default AgreementPage;
