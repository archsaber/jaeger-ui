// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from 'react';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import NotFound from './NotFound';
import Page from './Page';
import JaegerAPI, { DEFAULT_API_ROOT } from '../../api/jaeger';
import configureStore from '../../utils/configure-store';
import prefixUrl from '../../utils/prefix-url';
import {
  ConnectedAlertRulesPage,
  ConnectedAlertsPage,
  ConnectedDependencyGraphPage,
  ConnectedSearchTracePage,
  ConnectedServicePage
} from './loadable';

import ConnectedTracePage from '../TracePage';

import './index.css';
import '../common/utils.css';

const history = createHistory();

export default class JaegerUIApp extends Component {
  constructor(props) {
    super(props);
    this.store = configureStore(history);
    JaegerAPI.apiRoot = DEFAULT_API_ROOT;
  }

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={history}>
          <Page>
            <Switch>
              <Route path={prefixUrl('/search')} component={ConnectedSearchTracePage} />
              <Route path={prefixUrl('/trace/:id')} component={ConnectedTracePage} />
              <Route path={prefixUrl('/dependencies')} component={ConnectedDependencyGraphPage} />
              <Route path={prefixUrl('/alertrules')} component={ConnectedAlertRulesPage} />
              <Route path={prefixUrl('/alerts')} component={ConnectedAlertsPage} />
              <Route path={prefixUrl('/services')} component={ConnectedServicePage} />
              <Redirect exact path="/" to={prefixUrl('/services')} />
              <Redirect exact path={prefixUrl()} to={prefixUrl('/services')} />
              <Redirect exact path={prefixUrl('/')} to={prefixUrl('/services')} />
              <Route component={NotFound} />
            </Switch>
          </Page>
        </ConnectedRouter>
      </Provider>
    );
  }
}
