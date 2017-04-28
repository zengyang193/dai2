'use strict';

import React, { Component } from 'react';
import DefaultLayout from '../layout/default';

class OperatorPage extends Component {
  render () {
    let props = this.props;
    let __assets = this.props.__assets
    let stylesheets = [ __assets['slogin/operator_bj'].css ];
    let scripts = [  __assets['slogin/operator_bj'].js ];

    return (
      <DefaultLayout {...props} stylesheets={stylesheets} scripts={scripts}>
        <div id="app"></div>
      </DefaultLayout>
    );
  }
}

export default OperatorPage;

