// TODO: @ flow

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

import * as React from 'react';

import * as markers from './index.markers';
import LoadingIndicator from '../../common/LoadingIndicator';
import AlertRule from './alertrule.js'

import './index.css';

type SearchResultsProps = {
  loading: boolean,
  rules: [],
};

function ruleKey(rule) {
  return 'env=' + rule.Env +
    ',service=' + rule.Service +
    ',operation=' + rule.Operation +
    ',measure=' + rule.Measure +
    ',submeasure=' + rule.Submeasure
}

function getInitialValues(rule) {
  return {
    Service: rule.Service,
    Operation: rule.Operation,
    Function: rule.Function,
    Measure: rule.Measure,
    Submeasure: rule.Submeasure,
    Disabled: rule.Disabled,
    Upper: rule.Upper,
    Limit: rule.Limit.toString(),
    Type: rule.Type,
    Duration: (rule.Duration / 1e6 / 60).toString(),
    Env: rule.Env 
  }
}

export default class SearchResults extends React.PureComponent<SearchResultsProps> {
  props: SearchResultsProps;

  render() {
    const { loading, rules } = this.props;
    if (loading) {
      return <LoadingIndicator className="u-mt-vast" centered />;
    }
    if (!Array.isArray(rules) || !rules.length) {
      return (
        <div className="u-simple-card" data-test={markers.NO_RESULTS}>
          No stats found. Try another query.
        </div>
      );
    }

    return (
        <ul className="ub-list-reset">
          {
              rules.map((rule, index) => {
                  return (
                  <li className="ub-my3" key={index}>
                    <AlertRule {...rule} form={ruleKey(rule)} initialValues={getInitialValues(rule)} />
                  </li>)
                  })
          }
        </ul>
    );
  }
}
