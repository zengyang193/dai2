import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import 'styles/pages/slogin.scss';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import ons from 'onsenui'
import DevTools from 'mobx-react-devtools';

import OperatorLoginPage4BJ from 'scripts/components/slogin/operator/OperatorLoginPage4BJ';
import ResetPasswordPage4BJ from 'scripts/components/slogin/operator/ResetPasswordPage4BJ';
import OperatorLoginStore from 'scripts/stores/slogin/OperatorLoginStore';
import server from 'scripts/config/server';

const store = new OperatorLoginStore();
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [{
  exact: true,
  path: '/slogin/operator/bj/pwd',
  component: ResetPasswordPage4BJ
}, {
  exact: true,
  path: '/slogin/operator/bj',
  component: OperatorLoginPage4BJ
}];
const RootComponent = (
  <Provider store={store}>
    <Router history={history}>
      {renderRoutes(routes)}
    </Router>
  </Provider>
);

ons.disableAutoStyling();
ons.enableAutoStatusBarFill();

ons.ready(() => {
  render(
    <AppContainer>{RootComponent}</AppContainer>
  , rootElement);
});

if (module.hot) {
  module.hot.accept([
    'scripts/components/slogin/operator/OperatorLoginPage',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}

