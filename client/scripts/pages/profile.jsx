import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import 'styles/pages/profile.scss';

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import ons from 'onsenui'
import DevTools from 'mobx-react-devtools';

import IdentityImagePage from 'scripts/components/profile/IdentityImagePage';
import JobInfoPage from 'scripts/components/profile/JobInfoPage';
import ZhimaCreditPage from 'scripts/components/profile/ZhimaCreditPage';
import ZhimaCreditResult from 'scripts/components/profile/ZhimaCreditResult';
import ImportOperatorNavigator from 'scripts/components/profile/ImportOperatorNavigator';
import ProfileResultPage from 'scripts/components/profile/ProfileResultPage';
import ProfileStore from 'scripts/stores/profile/ProfileStore';
import IdentityImageStore from 'scripts/stores/profile/IdentityImageStore';
import server from 'scripts/config/server';

const profileStore = new ProfileStore();
const identityImageStore = new IdentityImageStore();
const stores = { profileStore, identityImageStore };

const rootElement = document.getElementById('app');
const history = createHistory({ basename: server.serverContext });
const routes = [
  { path: '/profile/idimage', component: IdentityImagePage },
  { path: '/profile/contact', component: JobInfoPage },
  { path: '/profile/operator', component: ImportOperatorNavigator },
  { path: '/profile/zmxy/result', component: ZhimaCreditResult },
  { path: '/profile/zmxy', component: ZhimaCreditPage },
  { path: '/profile/result', component: ProfileResultPage },
];
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
    'scripts/components/profile/IdentityImagePage',
    'scripts/components/profile/ImportOperatorNavigator',
  ], () => {
    render(
      <AppContainer>{RootComponent}</AppContainer>
    ,rootElement);
  });
}
