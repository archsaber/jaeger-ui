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
import moment from 'moment';
import PropTypes from 'prop-types';
import dimensions from 'react-dimensions';
import { XYPlot, XAxis, YAxis, Hint, LineMarkSeries } from 'react-vis';
import { compose, withState, withProps } from 'recompose';

import { formatDuration } from '../../../utils/date';

import './react-vis.css';
import './ScatterPlot.css';

function ScatterPlotImpl(props) {
  const { data, containerWidth, onValueClick, overValue, onValueOver, onValueOut } = props;
  var series = {}
  data.values.forEach(stat => {
    Object.keys(stat.value).forEach((key) => {
      if (!(key in series)) {
        series[key] = []
      }
      series[key].push({
        x: stat.timestamp / 1000,
        y: data.measure.includes('duration') ? stat.value[key] / 1e6 : stat.value[key],
        name: key + " - "  + (data.measure.includes('duration') ? formatDuration(stat.value[key] / 1e6, 'milliseconds') : stat.value[key]) + " (" + moment(stat.timestamp / 1000).format('hh:mm:ss a') + ")"
      })
    })
  })

  return (
    <div className="StatsResultsScatterPlot">
      <XYPlot
        margin={{
          left: 50,
        }}
        width={containerWidth}
        height={200}
      >
        <XAxis title="Time" tickTotal={4} tickFormat={t => moment(t).format('hh:mm:ss a')} style={{
          title: {fontWeight: 'bold'},
          ticks: {stroke: 'black', fontWeight: 'bold'},
          text: {stroke: 'none', fontWeight: 'bold', fontSize: 'small'}
        }} tickSize={3} />
        <YAxis title={data.measure} tickTotal={3}
          tickFormat={ data.measure.includes('duration') ? null : t => formatDuration(t, 'milliseconds') }
          style={{
            title: {fontWeight: 'bold'},
            ticks: {stroke: 'black', fontWeight: 'bold'},
            text: {stroke: 'none', fontWeight: 'bold', fontSize: 'small'}
          }} tickSize={3} />
        {
          Object.keys(series).map((key, index) => {
            return (
                <LineMarkSeries
              key={index}
              sizeRange={[3, 10]}
              opacity={0.5}
              onValueClick={onValueClick}
              onValueMouseOver={onValueOver}
              onValueMouseOut={onValueOut}
              data={series[key]}
              />
            )
          })
        }
        {overValue && (
          <Hint value={overValue}>
            <h4 className="scatter-plot-hint">{overValue.name || ""}</h4>
          </Hint>
        )}
      </XYPlot>
    </div>
  );
}

const valueShape = PropTypes.shape({
  measure: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object)
});

ScatterPlotImpl.propTypes = {
  containerWidth: PropTypes.number,
  data: valueShape.isRequired,
  onValueClick: PropTypes.func.isRequired,
  onValueOut: PropTypes.func.isRequired,
  onValueOver: PropTypes.func.isRequired,
};

ScatterPlotImpl.defaultProps = {
  containerWidth: null,
};

const ScatterPlot = compose(
  withState('overValue', 'setOverValue', null),
  withProps(({ setOverValue }) => ({
    onValueOver: value => setOverValue(value),
    onValueOut: () => setOverValue(null),
  }))
)(ScatterPlotImpl);

export default dimensions()(ScatterPlot);
