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
import { Form, Input, Button, Popover, Select } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import IoHelp from 'react-icons/lib/io/help';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import store from 'store';

import * as markers from './SearchForm.markers';
import VirtSelect from '../common/VirtSelect';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { formatDate, formatTime } from '../../utils/date';
import reduxFormFieldAdapter from '../../utils/redux-form-field-adapter';

import './SearchForm.css';

const FormItem = Form.Item;
const Option = Select.Option;

const AdaptedInput = reduxFormFieldAdapter(Input);
const AdaptedSelect = reduxFormFieldAdapter(Select);
const AdaptedVirtualSelect = reduxFormFieldAdapter(VirtSelect, option => (option ? option.value : null));

export function getUnixTimeStampInMSFromForm({ startDate, startDateTime, endDate, endDateTime }) {
  const start = `${startDate} ${startDateTime}`;
  const end = `${endDate} ${endDateTime}`;
  return {
    start: `${moment(start, 'YYYY-MM-DD HH:mm').valueOf()}000`,
    end: `${moment(end, 'YYYY-MM-DD HH:mm').valueOf()}000`,
  };
}

export function convertQueryParamsToFormDates({ start, end }) {
  let queryStartDate;
  let queryStartDateTime;
  let queryEndDate;
  let queryEndDateTime;
  if (end) {
    const endUnixNs = parseInt(end, 10);
    queryEndDate = formatDate(endUnixNs);
    queryEndDateTime = formatTime(endUnixNs);
  }
  if (start) {
    const startUnixNs = parseInt(start, 10);
    queryStartDate = formatDate(startUnixNs);
    queryStartDateTime = formatTime(startUnixNs);
  }

  return {
    queryStartDate,
    queryStartDateTime,
    queryEndDate,
    queryEndDateTime,
  };
}

export function submitForm(fields, fetchStats) {
  const {
    service,
    startDate,
    startDateTime,
    endDate,
    endDateTime,
    operation,
    lookback,
  } = fields;
  store.set('lastSearch', { service, operation });

  let start;
  let end;
  if (lookback !== 'custom') {
    const unit = lookback.substr(-1);
    const now = new Date();
    start =
      moment(now)
        .subtract(parseInt(lookback, 10), unit)
        .valueOf() * 1000;
    end = moment(now).valueOf() * 1000;
  } else {
    const times = getUnixTimeStampInMSFromForm({
      startDate,
      startDateTime,
      endDate,
      endDateTime,
    });
    start = times.start;
    end = times.end;
  }

  fetchStats({
    env: "none",
    measure: "",
    service,
    operation: operation !== 'all' ? operation : undefined,
    lookback,
    start,
    end,
  });
}

export function SearchFormImpl(props) {
  const { handleSubmit, selectedLookback, selectedService = '-', services, submitting: disabled } = props;
  const selectedServicePayload = services.find(s => s.name === selectedService);
  const opsForSvc = (selectedServicePayload && selectedServicePayload.operations) || [];
  const noSelectedService = selectedService === '-' || !selectedService;
  const tz = selectedLookback === 'custom' ? new Date().toTimeString().replace(/^.*?GMT/, 'UTC') : null;
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
            options: ['all'].concat(opsForSvc).map(v => ({ label: v, value: v })),
            required: true,
          }}
        />
      </FormItem>

      <FormItem label="Lookback">
        <Field name="lookback" component={AdaptedSelect} props={{ disabled, defaultValue: '1h' }}>
          <Option value="1h">Last Hour</Option>
          <Option value="2h">Last 2 Hours</Option>
          <Option value="3h">Last 3 Hours</Option>
          <Option value="6h">Last 6 Hours</Option>
          <Option value="12h">Last 12 Hours</Option>
          <Option value="24h">Last 24 Hours</Option>
          <Option value="2d">Last 2 Days</Option>
          <Option value="custom">Custom Time Range</Option>
        </Field>
      </FormItem>

      {selectedLookback === 'custom' && [
        <FormItem
          key="start"
          label={
            <div>
              Start Time{' '}
              <Popover
                placement="topLeft"
                trigger="click"
                content={
                  <h3 key="title" className="SearchForm--tagsHintTitle">
                    Times are expressed in {tz}
                  </h3>
                }
              >
                <IoHelp className="SearchForm--hintTrigger" />
              </Popover>
            </div>
          }
        >
          <Field
            name="startDate"
            type="date"
            component={AdaptedInput}
            placeholder="Start Date"
            props={{ disabled }}
          />
          <Field name="startDateTime" type="time" component={AdaptedInput} props={{ disabled }} />
        </FormItem>,

        <FormItem
          key="end"
          label={
            <div>
              End Time{' '}
              <Popover
                placement="topLeft"
                trigger="click"
                content={
                  <h3 key="title" className="SearchForm--tagsHintTitle">
                    Times are expressed in {tz}
                  </h3>
                }
              >
                <IoHelp className="SearchForm--hintTrigger" />
              </Popover>
            </div>
          }
        >
          <Field
            name="endDate"
            type="date"
            component={AdaptedInput}
            placeholder="End Date"
            props={{ disabled }}
          />
          <Field name="endDateTime" type="time" component={AdaptedInput} props={{ disabled }} />
        </FormItem>,
      ]}

      <Button htmlType="submit" disabled={disabled || noSelectedService} data-test={markers.SUBMIT_BTN}>
        Find Stats
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
  selectedLookback: PropTypes.string,
};

SearchFormImpl.defaultProps = {
  services: [],
  submitting: false,
  selectedService: null,
  selectedLookback: null,
};

export const statSideBarFormSelector = formValueSelector('statSideBar');

export function mapStateToProps(state) {
  const {
    service,
    start,
    end,
    operation,
    lookback,
  } = queryString.parse(state.router.location.search);

  const nowInMicroseconds = moment().valueOf() * 1000;
  const today = formatDate(nowInMicroseconds);
  const currentTime = formatTime(nowInMicroseconds);
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
          if (lastOp === 'all' || (ops && ops.includes(lastOp))) {
            lastSearchOperation = lastOp;
          }
        }
      }
    }
  }

  const {
    queryStartDate,
    queryStartDateTime,
    queryEndDate,
    queryEndDateTime,
  } = convertQueryParamsToFormDates({ start, end });

  return {
    destroyOnUnmount: false,
    initialValues: {
      service: service || lastSearchService || '-',
      lookback: lookback || '1h',
      startDate: queryStartDate || today,
      startDateTime: queryStartDateTime || '00:00',
      endDate: queryEndDate || today,
      endDateTime: queryEndDateTime || currentTime,
      operation: operation || lastSearchOperation || 'all',
    },
    selectedService: statSideBarFormSelector(state, 'service'),
    selectedLookback: statSideBarFormSelector(state, 'lookback'),
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchStats } = bindActionCreators(jaegerApiActions, dispatch);
  return {
    onSubmit: fields => submitForm(fields, fetchStats),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'statSideBar',
  })(SearchFormImpl)
);
