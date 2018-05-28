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
import ScatterPlot from './ScatterPlot';
import LoadingIndicator from '../../common/LoadingIndicator';

import './index.css';

type SearchResultsProps = {
  loading: boolean,
  stats: {}[],
};

export default class SearchResults extends React.PureComponent<SearchResultsProps> {
  props: SearchResultsProps;

  render() {
    const { loading, stats } = this.props;
    if (loading) {
      return <LoadingIndicator className="u-mt-vast" centered />;
    }
    if (!Array.isArray(stats) || !stats.length) {
      return (
        <div className="u-simple-card" data-test={markers.NO_RESULTS}>
          No stats found. Try another query.
        </div>
      );
    }

    return (
      <div>
        <div>
          {
            stats.map((stat, index) => {
              return (
                stat.values && stat.values.length > 0 &&
                <div className="SearchResults--header" key={index}>
                    <div className="ub-p3">
                      <ScatterPlot
                        onValueClick={t => {}}
                        data={stat}
                      />
                    </div>
                </div>
                )
              }
            )
          }
        </div>
      </div>
    );
  }
}
