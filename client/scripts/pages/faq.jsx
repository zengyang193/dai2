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

import FAQPage from 'scripts/components/settings/FAQPage';
import server from 'scripts/config/server';
import HomeStore from 'scripts/stores/HomeStore';

const homeStore = new HomeStore();
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [
  {path: '/faq',component: FAQPage}
];

const RootComponent = (
  <Provider homeStore={homeStore}>
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
    'scripts/components/settings/FAQPage',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
