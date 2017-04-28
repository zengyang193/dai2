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

import OperatorLoginPage from 'scripts/components/slogin/operator/OperatorLoginPage';
import OperatorLoginStore from 'scripts/stores/slogin/OperatorLoginStore';
import server from 'scripts/config/server';

const store = new OperatorLoginStore();
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [{
  path: '/slogin/operator/:type',
  component: OperatorLoginPage
}, {
  path: '/slogin/operator',
  component: OperatorLoginPage
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

