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

import React, { Component } from 'react';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';

import * as jaegerApiActions from '../../actions/jaeger-api';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIndicator from '../common/LoadingIndicator';
import getLastXformCacher from '../../utils/get-last-xform-cacher';

import './index.css';
import JaegerLogo from '../../img/jaeger-logo.svg';

export default class AlertsPage extends Component {
  componentDidMount() {
    const { fetchAlerts, urlQueryParams, fetchServices, fetchServiceOperations, loadingServices,
      services } = this.props;
    if (urlQueryParams.service) {
      fetchAlerts(urlQueryParams);
    }
    if (!services && !loadingServices) {
      fetchServices();
    }
    const { service } = store.get('lastSearch') || {};
    if (service && service !== '-') {
      const selectedServicePayload = services && services.find(s => s.name === service);
      const opsForSvc = (selectedServicePayload && selectedServicePayload.operations) || [];
      if (opsForSvc.length === 0) {
        fetchServiceOperations(service);
      }
    }
  }
  render() {
    const {
      errors,
      isHomepage,
      loadingServices,
      services,
      loadingAlerts,
      alerts
    } = this.props;
    const hasAlertsData = alerts && alerts.length > 0;
    const showErrors = errors && !loadingAlerts;
    const showLogo = isHomepage && !hasAlertsData && !loadingAlerts && !errors;
    return (
      <div>
        <Row>
          <Col span={6} className="SearchTracePage--column">
            <div className="SearchTracePage--find">
              <h2>Search Alerts</h2>
              {!loadingServices && services ? <SearchForm services={services} /> : <LoadingIndicator />}
            </div>
          </Col>
          <Col span={18} className="SearchTracePage--column">
            {showErrors && (
              <div className="js-test-error-message">
                <h2>There was an error querying for alerts:</h2>
                {errors.map(err => <ErrorMessage key={err.message} error={err} />)}
              </div>
            )}
            {showLogo && (
              <img
                className="SearchTracePage--logo js-test-logo"
                alt="presentation"
                src={JaegerLogo}
                width="400"
              />
            )}
            {!showErrors &&
              !showLogo && (
                <SearchResults
                  loading={loadingAlerts}
                  alerts={alerts}
                />
              )}
          </Col>
        </Row>
      </div>
    );
  }
}

AlertsPage.propTypes = {
  isHomepage: PropTypes.bool,
  alerts: PropTypes.array,
  loadingServices: PropTypes.bool,
  urlQueryParams: PropTypes.shape({
    service: PropTypes.string,
    limit: PropTypes.string,
  }),
  services: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      operations: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  fetchAlerts: PropTypes.func,
  fetchServiceOperations: PropTypes.func,
  fetchServices: PropTypes.func,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string,
    })
  ),
};

const stateServicesXformer = getLastXformCacher(stateServices => {
  const {
    loading: loadingServices,
    services: serviceList,
    operationsForService: opsBySvc,
    error: serviceError,
  } = stateServices;
  const services =
    serviceList &&
    serviceList.map(name => ({
      name,
      operations: opsBySvc[name] || [],
    }));
  return { loadingServices, services, serviceError };
});

const stateStatXformer = getLastXformCacher(stateStat => {
  const { alerts, loading: loadingAlerts, error: alertsError } = stateStat;
  return { alerts, loadingAlerts, alertsError };
});

// export to test
export function mapStateToProps(state) {
  const query = queryString.parse(state.router.location.search);
  const isHomepage = !Object.keys(query).length;
  const { loadingAlerts, alerts, alertsError } =  stateStatXformer(state.alerts);
  const { loadingServices, services, serviceError } = stateServicesXformer(state.services);
  const errors = [];
  if (alertsError) {
    errors.push(alertsError);
  }
  if (serviceError) {
    errors.push(serviceError);
  }
  return {
    isHomepage,
    alerts,
    loadingAlerts,
    services,
    loadingServices,
    errors: errors.length ? errors : null,
    urlQueryParams: query,
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchServices, fetchServiceOperations } = bindActionCreators(
    jaegerApiActions,
    dispatch
  );
  return {
    fetchServiceOperations,
    fetchServices,
  };
}
export const ConnectedAlertsPage = connect(mapStateToProps, mapDispatchToProps)(AlertsPage);
