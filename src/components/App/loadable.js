import React from 'react';
import Loadable from 'react-loadable';
import { Button } from 'antd';

import LoadingIndicator from '../common/LoadingIndicator';
import './loadable.css';

const loading = (props) => {
    if (props.error || props.timedOut) {
      return (
        <div className="centerDiv">
          <Button size='large' type="primary" onClick={ props.retry }>
            Please retry
          </Button>
        </div>
      );
    } else if (props.pastDelay) {
      return (
        <div className="centerDiv">
          <LoadingIndicator />
        </div>
      );
    } else {
      return null;
    }
}

const timeout = 8000;

export const ConnectedServicePage = Loadable({
    loader: () => import('../ServicePage'),
    loading,
    timeout,
});

export const ConnectedSearchTracePage = Loadable({
    loader: () => import('../SearchTracePage'),
    loading,
    timeout,
});

export const ConnectedAlertRulesPage = Loadable({
    loader: () => import('../AlertRulesPage'),
    loading,
    timeout,
});

export const ConnectedAlertsPage = Loadable({
    loader: () => import('../AlertsPage'),
    loading,
    timeout,
});

export const ConnectedTracePage = Loadable({
    loader: () => import('../TracePage'),
    loading,
    timeout,
});

export const ConnectedDependencyGraphPage = Loadable({
    loader: () => import('../DependencyGraph'),
    loading,
    timeout,
});