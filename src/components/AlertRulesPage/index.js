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
import { Col, Row, Button } from 'antd';
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
import { NewAlertForm } from './newAlertForm'

import './index.css';
import JaegerLogo from '../../img/jaeger-logo.svg';

export default class AlertRulesPage extends Component {
  state = {
    visible: false,
  };
  showModal = () => {
    this.setState({ visible: true });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const payload = {...values,
        Operation: values.Operation === 'none' ? '' : values.Operation,
        Upper: values.Upper === 'true',
        Type: 'threshold',
        Duration: parseFloat(values.Duration) * 60 * 1e3,
        Limit: parseFloat(values.Limit),
        Submeasure: values.Measure,
        Disabled: false,
        Env: 'none'}

      this.props.setAlertRule(payload);
      form.resetFields();
      this.setState({ visible: false });
    });
  }
  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  componentDidMount() {
    const { fetchAlertRules, urlQueryParams, fetchServices, fetchServiceOperations } = this.props;
    if (urlQueryParams.service) {
      fetchAlertRules(urlQueryParams);
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
      loadingRules,
      rules
    } = this.props;
    const hasRulesData = rules && rules.length > 0;
    const showErrors = errors && !loadingRules;
    const showLogo = isHomepage && !hasRulesData && !loadingRules && !errors;

    if (this.state.visible === true) {
      return (
        <div>
          <NewAlertForm
            services={services}
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
        </div>
      );
    }
    return (
      <div>
        <Row>
          <Col span={6} className="SearchTracePage--column">
            <div className="SearchTracePage--find">
              <h2>Search Alert Rules
              {!loadingServices && services ?
              <Button style={{marginLeft: '20px'}} onClick={this.showModal} >
                New Rule
              </Button> : undefined }
              </h2>
              {!loadingServices && services ? <SearchForm services={services} /> : <LoadingIndicator />}
            </div>
          </Col>
          <Col span={18} className="SearchTracePage--column">
            {showErrors && (
              <div className="js-test-error-message">
                <h2>There was an error querying for alert rules:</h2>
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
                  loading={loadingRules}
                  rules={rules}
                />
              )}
          </Col>
        </Row>
      </div>
    );
  }
}

AlertRulesPage.propTypes = {
  isHomepage: PropTypes.bool,
  rules: PropTypes.array,
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
  setAlertRule: PropTypes.func,
  fetchAlertRules: PropTypes.func,
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
  const { rules, loading: loadingRules, error: rulesError } = stateStat;
  return { rules, loadingRules, rulesError };
});

// export to test
export function mapStateToProps(state) {
  const query = queryString.parse(state.router.location.search);
  const isHomepage = !Object.keys(query).length;
  const { loadingRules, rules, rulesError } =  stateStatXformer(state.alertrules);
  const { loadingServices, services, serviceError } = stateServicesXformer(state.services);
  const errors = [];
  if (rulesError) {
    errors.push(rulesError);
  }
  if (serviceError) {
    errors.push(serviceError);
  }
  return {
    isHomepage,
    rules,
    loadingRules,
    services,
    loadingServices,
    errors: errors.length ? errors : null,
    urlQueryParams: query,
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchAlertRules, fetchServices, fetchServiceOperations, setAlertRule } = bindActionCreators(
    jaegerApiActions,
    dispatch
  );
  return {
    setAlertRule,
    fetchServiceOperations,
    fetchServices,
    fetchAlertRules,
  };
}
export const ConnectedAlertRulesPage = connect(mapStateToProps, mapDispatchToProps)(AlertRulesPage);
