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

import store from 'store';

import { createAction } from 'redux-actions';
import JaegerAPI from '../api/jaeger';

export const fetchAlerts = createAction(
  '@JAEGER_API/FETCH_ALERTS',
  query => JaegerAPI.fetchAlerts(query),
  query => ({ query })
);

export const fetchAlertRules = createAction(
  '@JAEGER_API/FETCH_ALERT_RULES',
  query => JaegerAPI.fetchAlertRules(query),
  query => ({ query })
);

export const setAlertRule = createAction(
  '@JAEGER_API/SET_ALERT_RULES',
  (alertBody) => JaegerAPI.setAlertRule(alertBody)
);

export const fetchStats = createAction(
  '@JAEGER_API/FETCH_STATS',
  query => JaegerAPI.fetchStats(query),
  query => ({ query })
);

export const fetchTrace = createAction(
  '@JAEGER_API/FETCH_TRACE',
  id => JaegerAPI.fetchTrace(id),
  id => ({ id })
);

export const archiveTrace = createAction(
  '@JAEGER_API/ARCHIVE_TRACE',
  id => JaegerAPI.archiveTrace(id),
  id => ({ id })
);

export const searchTraces = createAction(
  '@JAEGER_API/SEARCH_TRACES',
  query => JaegerAPI.searchTraces(query),
  query => ({ query })
);

export const fetchServiceOperations = createAction(
  '@JAEGER_API/FETCH_SERVICE_OPERATIONS',
  serviceName => JaegerAPI.fetchServiceOperations(serviceName),
  serviceName => ({ serviceName })
);

export const fetchDependencies = createAction('@JAEGER_API/FETCH_DEPENDENCIES', () =>
  JaegerAPI.fetchDependencies()
);

export const fetchServices = createAction('@JAEGER_API/FETCH_SERVICES', () => JaegerAPI.fetchServices());

export const login = createAction('@JAEGER_API/LOGIN', JaegerAPI.login);

export const register = createAction('@JAEGER_API/REGISTER', JaegerAPI.register);

export const logout = createAction('@JAEGER_API/LOGOUT', () => store.remove('jwtToken'));

export const userInfo = createAction('@JAEGER_API/USER_INFO', JaegerAPI.userInfo);
