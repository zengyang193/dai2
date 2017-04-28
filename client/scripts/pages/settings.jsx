import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import ons from 'onsenui'
import DevTools from 'mobx-react-devtools';

import LoanListPage from 'scripts/components/settings/LoanListPage';
import MySettingsPage from 'scripts/components/settings/MySettingsPage';
import AboutUsPage from 'scripts/components/settings/AboutUsPage';
import server from 'scripts/config/server';
import SettingsStore from 'scripts/stores/SettingsStore';

const settingsStore = new SettingsStore();
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [
  {path: '/settings/loanlist',component: LoanListPage},
  {path: '/settings/aboutus',component: AboutUsPage},
  {path: '/settings/mysettings',component: MySettingsPage}
];

const RootComponent = (
  <Provider settingsStore={settingsStore}>
    <Router history={history}>
      {renderRoutes(routes)}
    </Router>
  </Provider>
);


ons.disableAutoStyling();
ons.ready(() => {
  render(
    <AppContainer>{RootComponent}</AppContainer>
  , rootElement);
});

if (module.hot) {
  module.hot.accept([
    'scripts/components/settings/LoanListPage',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
