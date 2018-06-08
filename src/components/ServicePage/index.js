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
import { Col, Row, Card } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';
import * as Bizcharts from 'bizcharts';

import * as jaegerApiActions from '../../actions/jaeger-api';
import SearchForm from './SearchForm';
import { Metrics, ServiceBreakup } from './SearchResults';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIndicator from '../common/LoadingIndicator';
import getLastXformCacher from '../../utils/get-last-xform-cacher';

import './index.css';
import JaegerLogo from '../../img/jaeger-logo.svg';

Bizcharts.track(false);

export default class StatsPage extends Component {
  componentDidMount() {
    const { fetchStats, urlQueryParams, fetchServices, fetchServiceOperations , services,
      loadingServices, service, operation } = this.props;
    if (service) {
      if (operation === 'none') {
        fetchStats({
          ...urlQueryParams, allOperations: 'y', env: 'none', service, operation: undefined,
        });

        fetchStats({
          ...urlQueryParams, env: 'none', service, operation: '',
        })
      } else {
        fetchStats({ ...urlQueryParams, env: 'none', service, operation});
      }
      store.set('lastSearch', { service, operation, start: urlQueryParams.start, end: urlQueryParams.end });
    }
    
    if (!services && !loadingServices) {
      fetchServices();
    }
    const { service: lastService } = store.get('lastSearch') || {};
    if (lastService && lastService !== '-') {
      const selectedServicePayload = services && services.find(s => s.name === lastService);
      const opsForSvc = (selectedServicePayload && selectedServicePayload.operations) || [];
      if (opsForSvc.length === 0) {
        fetchServiceOperations(lastService);
      }
    }
  }

  render() {
    const {
      errors,
      isHomepage,
      loadingStats,
      loadingServices,
      services,
      stats,
      service,
      operation,
    } = this.props;

    const hasStatsData = stats && Object.keys(stats).length > 0;
    const showErrors = errors && !loadingStats;
    const showLogo = isHomepage && !hasStatsData && !loadingStats && !errors;

    return (
      <div style={{background: '#e4e7ec', paddingBottom: loadingStats ? '10rem' : undefined }}>
        <Row>
          <Col span={24} className="SearchTracePage--column">
          {
            isHomepage ? (
              <div className="SearchTracePage--find">
                {!loadingServices && services ? <SearchForm services={services} /> : <LoadingIndicator />}
              </div>
            ) : (
              <Card title={service + " : " + operation}>
              </Card>
            )
          }
          </Col>
        </Row >
        {
          loadingStats && (
            <LoadingIndicator className="u-mt-vast" centered />
          )
        }
        {
          showErrors && (
            <div className="js-test-error-message">
              <h2>There was an error querying for stats:</h2>
              {errors.map(err => <ErrorMessage key={err.message} error={err} />)}
            </div>
            )
        }
        {
          showLogo &&
            <img
              className="SearchTracePage--logo js-test-logo"
              alt="presentation"
              src={JaegerLogo}
              width="400"
            />
        }
        {
          !loadingStats && !showLogo && !showErrors &&
            <div>
              <Row>
                {
                  ['hits', 'duration', 'errors'].map((measure) => {
                    return (
                      <Col key={measure} span={8} style={{padding: '1rem'}}>
                        {hasStatsData && (
                          <Metrics
                            measure={measure}
                            stats={stats}
                          />
                        )}
                      </Col>
                    );
                  })
                }
              </Row>
              <Row>
                <Col span={16}>
                  {hasStatsData && operation === 'none' && <ServiceBreakup />}
                </Col>
              </Row>
            </div>
        }
      </div>
    );
  }
}

StatsPage.propTypes = {
  isHomepage: PropTypes.bool,
  stats: PropTypes.object,
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
  const { loading: loadingStats, error: statsError, ...stats } = stateStat;
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

  const {
    service: queryService,
    operation: queryOperation,
    start: queryStart,
    end: queryEnd,
  } = query;

  const lastSearch = store.get('lastSearch');
  let lastSearchService;
  let lastSearchOperation;
  let lastStart;
  let lastEnd;

  if (lastSearch) {
    // last search is only valid if the service is in the list of services
    const { operation: lastOp, service: lastSvc, start, end } = lastSearch;
    lastStart = start;
    lastEnd = end;
    if (lastSvc && lastSvc !== '-') {
      if (state.services && state.services.services && state.services.services.includes(lastSvc)) {
        lastSearchService = lastSvc;
        if (lastOp && lastOp !== '-') {
          const ops = state.services.operationsForService[lastSvc];
          if (lastOp === 'none' || (ops && ops.includes(lastOp))) {
            lastSearchOperation = lastOp;
          }
        }
      }
    }
  }

  return {
    service: queryService || lastSearchService,
    operation: queryOperation || lastSearchOperation,
    isHomepage,
    stats,
    loadingStats,
    services,
    loadingServices,
    errors: errors.length ? errors : null,
    urlQueryParams: query,
    start: queryStart || lastStart,
    end: queryEnd || lastEnd,
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
export const ConnectedServicePage = connect(mapStateToProps, mapDispatchToProps)(StatsPage);
