import { handleActions } from 'redux-actions';
import { userInfo } from '../actions/jaeger-api';

export const USER_INFO_INIT = 'INIT';
export const USER_INFO_LOADING = 'LOADING';
export const USER_INFO_FETCHED = 'FETCHED';
export const USER_INFO_ERROR = 'ERROR';

const initialState =  {
    info_status: USER_INFO_INIT,
    info: {}
};

function fetchUserInfoStarted(state) {
  return { ...state, info_status: USER_INFO_LOADING };
}

function fetchUserInfoDone(state, { payload }) {
  return { ...state, info_status: USER_INFO_FETCHED, info: payload };
}

function fetchUserInfoRejected(state, action) {
  return { ...state, info_status: USER_INFO_ERROR };
}

export default handleActions(
  {
    [`${userInfo}_PENDING`]: fetchUserInfoStarted,
    [`${userInfo}_FULFILLED`]: fetchUserInfoDone,
    [`${userInfo}_REJECTED`]: fetchUserInfoRejected,
  },
  initialState
);
