import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import ons from 'onsenui'

import MainPage from 'scripts/components/MainPage';
import HomeStore from 'scripts/stores/HomeStore';
import UserStore from 'scripts/stores/UserStore';
import SettingsStore from 'scripts/stores/SettingsStore';
import server from 'scripts/config/server';

const stores = {
  homeStore: new HomeStore(),
  userStore: new UserStore(),
  settingsStore: new SettingsStore(),
};

const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [{
  path: '/(settings)?',
  component: MainPage,
}];
const RootComponent = (
  <Provider {...stores}>
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
    'scripts/components/MainPage',
    'scripts/components/home/HomePage',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
