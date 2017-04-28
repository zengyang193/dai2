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

import BindBankCard from 'scripts/components/application/BindBankCardPage';
import BankCardList from 'scripts/components/application/BankCardListPage';
import SelectCardPage from 'scripts/components/application/SelectCardPage';
import RepaymentSucPage from 'scripts/components/application/RepaymentSucPage';
import SucResultPage from 'scripts/components/application/SucResultPage';
import ApplicationStore from 'scripts/stores/ApplicationStore';
import HomeStore from 'scripts/stores/HomeStore';
import server from 'scripts/config/server';

const applicationStore = new ApplicationStore();
const stores = {
  homeStore: new HomeStore(),
  applicationStore: new ApplicationStore(),
};
const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [
  {path: '/application/bindcard',component: BindBankCard},
  {path: '/application/:originalId/bindcard',component: BindBankCard},
  {path: '/application/cardlist',component: BankCardList},
  {path: '/application/repayment/suc',component: RepaymentSucPage},
  {path: '/application/:originalId/selectcard',component: SelectCardPage},
  {path: '/application/sucresult',component: SucResultPage},
];
const RootComponent = (
  <Provider {...stores}>
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
    'scripts/components/application/BindBankCardPage',
    'scripts/components/application/BankCardListPage',
    'scripts/components/application/SelectCardPage'
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
