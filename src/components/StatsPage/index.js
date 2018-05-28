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

export default class StatsPage extends Component {
  componentDidMount() {
    const { fetchStats, urlQueryParams, fetchServices, fetchServiceOperations } = this.props;
    if (urlQueryParams.service) {
      fetchStats(urlQueryParams);
    }
    fetchServices();
    const { service } = store.get('lastSearch') || {};
    if (service && service !== '-') {
      fetchServiceOperations(service);
    }
  }
  render() {
    const {
      errors,
      isHomepage,
      loadingServices,
      services,
      loadingStats,
      stats
    } = this.props;
    const hasStatsData = stats && stats.length > 0;
    const showErrors = errors && !loadingStats;
    const showLogo = isHomepage && !hasStatsData && !loadingStats && !errors;
    return (
      <div>
        <Row>
          <Col span={6} className="SearchTracePage--column">
            <div className="SearchTracePage--find">
              <h2>Explore Stats</h2>
              {!loadingServices && services ? <SearchForm services={services} /> : <LoadingIndicator />}
            </div>
          </Col>
          <Col span={18} className="SearchTracePage--column">
            {showErrors && (
              <div className="js-test-error-message">
                <h2>There was an error querying for stats:</h2>
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
                  loading={loadingStats}
                  stats={stats}
                />
              )}
          </Col>
        </Row>
      </div>
    );
  }
}

StatsPage.propTypes = {
  isHomepage: PropTypes.bool,
  statsData: PropTypes.array,
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
  fetchStats: PropTypes.func,
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
  const { stats, loading: loadingStats, error: statsError } = stateStat;
  return { stats, loadingStats, statsError };
});

// export to test
export function mapStateToProps(state) {
  const query = queryString.parse(state.router.location.search);
  const isHomepage = !Object.keys(query).length;
  const { loadingStats, stats, statsError } =  stateStatXformer(state.stat);
  const { loadingServices, services, serviceError } = stateServicesXformer(state.services);
  const errors = [];
  if (statsError) {
    errors.push(statsError);
  }
  if (serviceError) {
    errors.push(serviceError);
  }
  return {
    isHomepage,
    stats,
    loadingStats,
    services,
    loadingServices,
    errors: errors.length ? errors : null,
    urlQueryParams: query,
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchStats, fetchServices, fetchServiceOperations } = bindActionCreators(
    jaegerApiActions,
    dispatch
  );
  return {
    fetchServiceOperations,
    fetchServices,
    fetchStats,
  };
}
export const ConnectedStatsPage = connect(mapStateToProps, mapDispatchToProps)(StatsPage);
