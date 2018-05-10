import store from 'store';

import { handleActions } from 'redux-actions';
import { login, logout } from '../actions/jaeger-api';
import { setToken } from '../api/jaeger'
import { decodeToken } from '../utils/jwt'


const AUTH_LOADING = 'LOADING';
const AUTH_LOGGED_IN = 'LOGGED_IN';
const AUTH_LOGGED_OUT = 'LOGGED_OUT';

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
};

function fetchStarted(state) {
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

export default handleActions(
  {
    [`${login}_PENDING`]: fetchStarted,
    [`${login}_FULFILLED`]: fetchLoginDone,
    [`${login}_REJECTED`]: fetchLoginRejected,

    [`${logout}`]: logOut,
  },
  initialState
);
