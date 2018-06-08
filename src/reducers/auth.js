import store from 'store';

import { handleActions } from 'redux-actions';
import { login, logout, register } from '../actions/jaeger-api';
import { setToken } from '../api/jaeger'
import { decodeToken } from '../utils/jwt'

export const REGISTRATION_INIT = 'NOT_STARTED';
export const REGISTRATION_STARTED = 'STARTED';
export const REGISTRATION_SUCCESS = 'SUCCESS';
export const REGISTRATION_FAILURE = 'FAILURE';

export const AUTH_LOADING = 'LOADING';
export const AUTH_LOGGED_IN = 'LOGGED_IN';
export const AUTH_LOGGED_OUT = 'LOGGED_OUT';

function loadTokenFromLocalStorage() {
  const token = store.get('jwtToken');
  if (token === null) {
      return false;
  }
  try {
    const tokenData = decodeToken(token);
    const expires = new Date(tokenData.exp * 1000);
    if (expires < new Date()) {
        return false;
    }
    setToken(token)
    return true;
  } catch(e) {
    return false;
  }
}

const initialState =  {
    login_status: loadTokenFromLocalStorage() ? AUTH_LOGGED_IN : AUTH_LOGGED_OUT,
    register_status: REGISTRATION_INIT
};

function fetchLoginStarted(state) {
  return { ...state, login_status: AUTH_LOADING };
}

function fetchLoginDone(state, { payload }) {
  store.set('jwtToken', payload.token);
  setToken(payload.token);
  return { ...state, login_status: AUTH_LOGGED_IN}
}

function fetchLoginRejected(state, action) {
  return { ...state, login_status: AUTH_LOGGED_OUT };
}

function logOut(state, action) {
  return { ...state, login_status: AUTH_LOGGED_OUT };
}

// New user registration

function fetchRegisterStarted(state) {
  return { ...state, register_status: REGISTRATION_STARTED };
}

function fetchRegisterDone(state, { payload }) {
  return { ...state, register_status: REGISTRATION_SUCCESS };
}

function fetchRegisterRejected(state, action) {
  return { ...state, register_status: REGISTRATION_FAILURE };
}

export default handleActions(
  {
    [`${login}_PENDING`]: fetchLoginStarted,
    [`${login}_FULFILLED`]: fetchLoginDone,
    [`${login}_REJECTED`]: fetchLoginRejected,

    [`${register}_PENDING`]: fetchRegisterStarted,
    [`${register}_FULFILLED`]: fetchRegisterDone,
    [`${register}_REJECTED`]: fetchRegisterRejected,

    [`${logout}`]: logOut,
  },
  initialState
);
