import { handleActions } from 'redux-actions';

import { fetchAlerts } from '../actions/jaeger-api';

const initialState = {
  alerts: [],
  loading: false,
  error: null,
};

function fetchStarted(state) {
  return { ...state, loading: true };
}

function fetchDone(state, { payload }) {
  return { ...state, alerts: payload.data, error: null, loading: false };
}

function fetchErred(state, action) {
  const error = action.payload;
  return { ...state, error, loading: false, alerts: [] };
}

export default handleActions(
  {
    [`${fetchAlerts}_PENDING`]: fetchStarted,
    [`${fetchAlerts}_FULFILLED`]: fetchDone,
    [`${fetchAlerts}_REJECTED`]: fetchErred,
  },
  initialState
);
