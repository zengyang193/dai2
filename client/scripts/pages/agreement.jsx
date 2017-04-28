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

import UserServiceAgreementPage from 'scripts/components/agreement/UserServiceAgreementPage';
import AuthorizationLetterPage from 'scripts/components/agreement/AuthorizationLetterPage';
import IntermediateServicePage from 'scripts/components/agreement/IntermediateServicePage';
import server from 'scripts/config/server';
import AgreementStore from 'scripts/stores/agreement/AgreementStore';

const agreementStore = new AgreementStore();
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [
  {path: '/agreement/user_service',component: UserServiceAgreementPage},
  {path: '/agreement/intermediate_service',component: IntermediateServicePage},
  {path: '/agreement/authorization_letter',component: AuthorizationLetterPage}
];

const RootComponent = (
  <Provider agreementStore={agreementStore}>
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
    'scripts/components/agreement/UserServiceAgreementPage',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
