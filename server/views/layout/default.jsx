import React, { Component } from 'react';
import _ from 'lodash';

export default class DefaultLayout extends Component {
  render () {
    let props = this.props;
    let __assets = this.props.__assets;
    let __server = this.props.__server;
    let stylesheets = this.props.stylesheets || [];
    let scripts = this.props.scripts || [];

    let styleElements = _.map(stylesheets, function (styleSrc, idx) {
      if (!/^(https?:)?\/\//g.test(styleSrc)) {
        styleSrc = props.h5root + '/' + styleSrc;

      }
      return (<link key={`styleElement${idx}`} rel="stylesheet" href={styleSrc}></link>);
    });

    let scriptElements = _.map(scripts, function (scriptSrc, idx) {
      if (!/^(https?:)?\/\//g.test(scriptSrc)) {
        scriptSrc = props.h5root + '/' + scriptSrc;
      }
      return (<script key={`scriptElement${idx}`} type='text/javascript' src={scriptSrc} charSet='utf-8'></script>);
    });

    let globals = `
      window.__PLATFORM__ = "${props.platform}";
      window.__CHANNEL__ = "${props.channel}";
      window.__CHANNEL_CODE__ = "${props.channelCode}";
      window.__IS_APP__ = ${!!props.isApp};
      window.__APP_VERSION__ = "${props.appVersion}";
      window.__SHOW_NAV_BAR__ = ${props.showNavBar};
      window.__SHOW_TAB_BAR__ = ${props.showTabBar};
      window.__OS_FAMILY__ = "${props.osFamily}";
      window.__OS_VERSION__ = "${props.osVersion}";
      window.__SERVER__ = ${JSON.stringify(props.exposedServer)};
      window.__WX_SIGNATURE__ = ${JSON.stringify(props.wxSignature)};
    `;

    return (
      <html>
        <head>
          <meta charSet="UTF-8" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Cache-Control" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <meta name="description" content="开薪贷" />
          <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
          {/*<meta httpEquiv="Content-Security-Policy" content="default-src * 'self' *.91gfd.com g.alicdn.com *.qq.com; style-src 'unsafe-inline' 'self' *.91gfd.com g.alicdn.com *.qq.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.91gfd.com g.alicdn.com *.qq.com; img-src * 'self' data: *.91gfd.com" />*/}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="format-detection" content="telephone=no" />
          <title>{props.title}</title>

          <link rel="stylesheet" href={__assets.dsui.css}></link>
          {styleElements}

          {/*<script type='text/javascript' src={`${props.h5root}/cordova/cordova_${props.platform}.js`} charSet='utf-8'></script>*/}
          <script type='text/javascript' dangerouslySetInnerHTML={{__html: globals}}></script>
        </head>
        <body className='theme-gfd'>

          {props.children}

          <script type='text/javascript' src={__assets.vendor.js} charSet='utf-8'></script>
          <script type='text/javascript' src={__assets.dsui.js} charSet='utf-8'></script>
          {scriptElements}
          <script type="text/javascript" src="http://tajs.qq.com/stats?sId=61231334" charSet="UTF-8"></script>
        </body>
      </html>
    );
  }
}
