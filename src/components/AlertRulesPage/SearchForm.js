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

import React from 'react';
import { Form, Button } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import store from 'store';

import * as markers from './SearchForm.markers';
import VirtSelect from '../common/VirtSelect';
import * as jaegerApiActions from '../../actions/jaeger-api';
import reduxFormFieldAdapter from '../../utils/redux-form-field-adapter';

import './SearchForm.css';

const FormItem = Form.Item;
const AdaptedVirtualSelect = reduxFormFieldAdapter(VirtSelect, option => (option ? option.value : null));

export function submitForm(fields, fetchAlertRules) {
  const {
    service,
    operation,
  } = fields;
  store.set('lastSearch', { service, operation });

  fetchAlertRules({
    env: "none",
    service,
    operation: operation !== 'all' ? (operation === 'none' ? undefined : operation) : undefined,
    allOperations: operation !== 'all' || operation === 'none' ? undefined : 'y',
  });
}

export function SearchFormImpl(props) {
  const { handleSubmit, selectedService = '-', services, submitting: disabled } = props;
  const selectedServicePayload = services.find(s => s.name === selectedService);
  const opsForSvc = (selectedServicePayload && selectedServicePayload.operations) || [];
  const noSelectedService = selectedService === '-' || !selectedService;
  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <FormItem
        label={
          <span>
            Service <span className="SearchForm--labelCount">({services.length})</span>
          </span>
        }
      >
        <Field
          name="service"
          component={AdaptedVirtualSelect}
          placeholder="Select A Service"
          props={{
            disabled,
            clearable: false,
            options: services.map(v => ({ label: v.name, value: v.name })),
            required: true,
          }}
        />
      </FormItem>
      <FormItem
        label={
          <span>
            Operation <span className="SearchForm--labelCount">({opsForSvc ? opsForSvc.length : 0})</span>
          </span>
        }
      >
        <Field
          name="operation"
          component={AdaptedVirtualSelect}
          placeholder="Select An Operation"
          props={{
            clearable: false,
            disabled: disabled || noSelectedService,
            options: ['all', 'none'].concat(opsForSvc).map(v => ({ label: v, value: v })),
            required: true,
          }}
        />
      </FormItem>

      <Button htmlType="submit" disabled={disabled || noSelectedService} data-test={markers.SUBMIT_BTN}>
        Find Alert Rules
      </Button>
    </Form>
  );
}

SearchFormImpl.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  services: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      operations: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  selectedService: PropTypes.string,
};

SearchFormImpl.defaultProps = {
  services: [],
  submitting: false,
  selectedService: null,
};

export const statSideBarFormSelector = formValueSelector('alertruleSideBar');

export function mapStateToProps(state) {
  const {
    service,
    operation,
  } = queryString.parse(state.router.location.search);

  const lastSearch = store.get('lastSearch');
  let lastSearchService;
  let lastSearchOperation;

  if (lastSearch) {
    // last search is only valid if the service is in the list of services
    const { operation: lastOp, service: lastSvc } = lastSearch;
    if (lastSvc && lastSvc !== '-') {
      if (state.services.services.includes(lastSvc)) {
        lastSearchService = lastSvc;
        if (lastOp && lastOp !== '-') {
          const ops = state.services.operationsForService[lastSvc];
          if (lastOp === 'all' || lastOp === 'none' || (ops && ops.includes(lastOp))) {
            lastSearchOperation = lastOp;
          }
        }
      }
    }
  }

  return {
    destroyOnUnmount: false,
    initialValues: {
      service: service || lastSearchService || '-',
      operation: operation || lastSearchOperation || 'all',
    },
    enableReinitialize: true,
    selectedService: statSideBarFormSelector(state, 'service'),
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchAlertRules } = bindActionCreators(jaegerApiActions, dispatch);
  return {
    onSubmit: fields => submitForm(fields, fetchAlertRules),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'alertruleSideBar',
  })(SearchFormImpl)
);
