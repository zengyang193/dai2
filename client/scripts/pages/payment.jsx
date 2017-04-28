import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import 'styles/pages/payment.scss'

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import ons from 'onsenui'
import DevTools from 'mobx-react-devtools';

import JingDongPayment from 'scripts/components/payment/JingDongPayment';
import LianLianPayment from 'scripts/components/payment/LianLianPayment';
import PaymentResult from 'scripts/components/payment/PaymentResult';
import PaymentStore from 'scripts/stores/PaymentStore';
import server from 'scripts/config/server';

const stores = {
  paymentStore: new PaymentStore(),
};

const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [{
  path: '/payment/lianlian',
  component: LianLianPayment,
}, {
  path: '/payment/jd',
  component: JingDongPayment,
}, {
  path: '/payment/success',
  component: PaymentResult,
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
    'scripts/components/payment/JingDongPayment',
    'scripts/components/payment/PaymentResult',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}

