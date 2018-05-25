import keyBy from 'lodash/keyBy';
import { handleActions } from 'redux-actions';

import { fetchStats } from '../actions/jaeger-api';
import transformTraceData from '../model/transform-trace-data';

const initialState = {
  stats: [],
  loading: false,
  error: null,
};

function fetchStarted(state) {
  return { ...state, loading: true };
}

function fetchDone(state, { payload }) {
  return { ...state, stats: payload.data, error: null, loading: false };
}

function fetchErred(state, action) {
  const error = action.payload;
  return { ...state, error, loading: false, stats: [] };
}

export default handleActions(
  {
    [`${fetchStats}_PENDING`]: fetchStarted,
    [`${fetchStats}_FULFILLED`]: fetchDone,
    [`${fetchStats}_REJECTED`]: fetchErred,
  },
  initialState
);
