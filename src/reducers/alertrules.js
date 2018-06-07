import { handleActions } from 'redux-actions';

import { fetchAlertRules, setAlertRule } from '../actions/jaeger-api';

const initialState = {
  rules: [],
  loading: false,
  error: null,
};

function fetchStarted(state) {
  return { ...state, loading: true };
}

function fetchDone(state, { payload }) {
  return { ...state, rules: payload.data, error: null, loading: false };
}

function fetchErred(state, action) {
  const error = action.payload;
  return { ...state, error, loading: false, rules: [] };
}

function setDone(state, { payload }) {
  return state;
}

export default handleActions(
  {
    [`${fetchAlertRules}_PENDING`]: fetchStarted,
    [`${fetchAlertRules}_FULFILLED`]: fetchDone,
    [`${fetchAlertRules}_REJECTED`]: fetchErred,
    [`${setAlertRule}_FULFILLED`]: setDone,
  },
  initialState
);
