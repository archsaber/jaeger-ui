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
import { Chart, Tooltip, Geom, Axis } from 'bizcharts';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { Card } from 'antd';
import store from 'store';
import _ from 'lodash';

import { formatDuration } from '../../../utils/date';
import { getReadableMeasure } from '../../../utils/stats';

import './index.css';

type SearchResultsProps = {
  stats: {},
};

class SearchResultsImpl extends React.PureComponent<SearchResultsProps> {
  props: SearchResultsProps;

  render() {
    const { stats, measure, selectedOperation, selectedService, start, end } = this.props;
    const filteredKeys = Object.keys(stats).filter((statKey) => {
      const parts = statKey.split('|')
      if (parts.length < 4) {
        return false;
      }
      return parts[0] === 'none' && parts[1] === selectedService &&
        parts[2] === (selectedOperation === 'none' ? '' : selectedOperation) && parts[3] === measure;
    })

    if (filteredKeys.length <= 0) {
      return null;
    }

    return (
        <div>
          {
            filteredKeys.map((statKey, index) => {
              const stat = stats[statKey];
              if (!stat.values || stat.values.length === 0) {
                return undefined;
              }
              let data = [];
              let minValue = Number.MAX_VALUE;
              let maxValue = Number.MIN_VALUE;
              const isDuration = stat.measure.includes('duration');
              stat.values.forEach((point) => {
                if (point.timestamp > end || point.timestamp < start) {
                  return
                }
                const yValue = _.round(isDuration ? point.value[stat.measure] / 1e6 :
                  point.value[stat.measure], 2);
                minValue = Math.min(minValue, yValue);
                maxValue = Math.max(maxValue, yValue);
                data.push({
                  x: new Date(point.timestamp / 1000),
                  y: yValue
                })
              });
              const scale = {
                x: {
                  type: 'time',
                  mask: 'HH:mm:ss',
                  tickCount : 4
                },
                y: { min: minValue, max: maxValue, alias: stat.measure }
              }
              return data.length === 0 ? null : (
                <Card
                  key={index}
                  bordered={false}
                  title={getReadableMeasure(stat.measure)}
                >
                    <Chart
                      width={400}
                      height={250}
                      data={data}
                      scale={scale}
                      padding={[ 20, 20, 40, isDuration ? 60 : 40]}
                    >
                      <Axis name="x" />
                      <Tooltip />
                      <Axis name="y" label={{formatter: val => {
                        return isDuration ? formatDuration(val, 'milliseconds') : val;
                      }}} />
                      <Geom type="line" position="x*y" size={1} />
                    </Chart>
                </Card>
              )
            })
          }
        </div>
    );
  }
}

function mapStateToProps(state) {
  const {
    service,
    start: queryStart,
    end: queryEnd,
    operation,
  } = queryString.parse(state.router.location.search);

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
    start: queryStart || lastStart,
    end: queryEnd || lastEnd,
    selectedOperation : operation || lastSearchOperation,
    selectedService: service || lastSearchService,
  };
}

export default connect(mapStateToProps)(SearchResultsImpl);
