'use strict';

import React, { Component } from 'react';
import DefaultLayout from '../layout/default';

class FAQPage extends Component {
  render () {
    let props = this.props;
    let __assets = this.props.__assets
    let stylesheets = [ __assets.faq.css ];
    let scripts = [  __assets.faq.js ];
    setTimeout(function(){
      console.log(props,'2222222')
    },1000)
    return (
      <DefaultLayout {...props} stylesheets={stylesheets} scripts={scripts}>
        <div id="app"></div>
      </DefaultLayout>
    );
  }
}

export default FAQPage;
