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

import promiseMiddleware from 'redux-promise-middleware';
import queryString from 'query-string';
import { change } from 'redux-form';
import { replace } from 'react-router-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { searchTraces, fetchServiceOperations } from '../actions/jaeger-api';
import prefixUrl from '../utils/prefix-url';

export { default as trackMiddleware } from './track';

/**
 * Middleware to load "operations" for a particular service.
 */
export const loadOperationsForServiceMiddleware = store => next => action => {
  if (
    action.type === '@@redux-form/CHANGE' &&
    (action.meta.form === 'searchSideBar' || action.meta.form === 'statSideBar' ||
    action.meta.form === 'alertruleSideBar') &&
    action.meta.field === 'service' &&
    action.payload !== '-'
  ) {
    store.dispatch(fetchServiceOperations(action.payload));
    store.dispatch(change(action.meta.form, 'operation', 'all'));
  } else if (action.type === '@JAEGER_API/SET_ALERT_RULES_FULFILLED') {
    toast.success("Success !", {
      position: toast.POSITION.TOP_CENTER
    });
  } else if (action.type === '@JAEGER_API/SET_ALERT_RULES_REJECTED') {
    toast.error("Error !", {
      position: toast.POSITION.TOP_CENTER
    });
  }
  return next(action);
};

export const historyUpdateMiddleware = store => next => action => {
  if (action.type === String(searchTraces)) {
    const url = prefixUrl(`/search?${queryString.stringify(action.meta.query)}`);
    store.dispatch(replace(url));
  }
  next(action);
};

export const promise = promiseMiddleware();
