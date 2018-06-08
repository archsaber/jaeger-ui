import { handleActions } from 'redux-actions';

import { fetchStats } from '../actions/jaeger-api';

const initialState = {
  loading: false,
  error: null
};

function fetchStarted(state, { payload }) {
  return { ...state, loading: true, error: null };
}

function fetchDone(state, { payload, meta: { query } }) {
  const base = {};
  if (query.allOperations && query.service && query.env) {
    Object.keys(state).forEach((key) => {
      const parts = key.split('|')
      if (parts.length < 4) {
        return;
      }
      if (parts[0] === query.env && parts[1] === query.service && parts[2] !== '') {
        base[key] = {
         ...state[key], values: []
        }
      }
    })
  }

  const fetchedStats = {};
  payload.data.forEach((stat) => {

    const key = stat.environment + '|' + stat.serviceName + '|' + stat.operationName +
      '|' + stat.measure;

    fetchedStats[key] = {
      env: stat.environment,
      service: stat.serviceName,
      operation: stat.operationName,
      measure: stat.measure,
      values: stat.values,
      start: stat.startTime,
      end: stat.endTime
    }
  });
  return { ...state, ...base, ...fetchedStats, error: null, loading: false,};
}

function fetchErred(state, action) {
  const error = action.payload;
  return { ...state, error, loading: false};
}

export default handleActions(
  {
    [`${fetchStats}_PENDING`]: fetchStarted,
    [`${fetchStats}_FULFILLED`]: fetchDone,
    [`${fetchStats}_REJECTED`]: fetchErred,
  },
  initialState
);
