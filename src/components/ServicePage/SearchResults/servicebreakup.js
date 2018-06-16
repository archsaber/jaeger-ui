import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import queryString from 'query-string';
import { Col, Row, Card, Table, Radio } from 'antd';
import store from 'store';
import 'ant-design-pro/dist/ant-design-pro.css';
import { Chart, Tooltip, Geom, Axis } from 'bizcharts';
import _ from 'lodash';

import getLastXformCacher from '../../../utils/get-last-xform-cacher';
import { getReadableMeasure } from '../../../utils/stats';
import { formatDuration } from '../../../utils/date';

const PAGE_SIZE = 5;

class ServiceBreakupImpl extends Component {
    state = {
        currentTabKey: 'hits',
        dataByMeasure: {},
        currentPage: 1,
        selectedOps: {}
    }

    computeDataByMeasure(props) {
        const { stats, selectedService, start, end } = props;
        const dataByMeasure = {};
        Object.keys(stats).forEach((statKey) => {
            const parts = statKey.split('|');
            if (parts.length < 4) {
                return;
            }
            const service = parts[1]
            if (service !== selectedService) {
                return;
            }
            const operation = parts[2]
            if (operation === '') {
                return;
            }
            const measure = parts[3]
            const dataForMeasure = dataByMeasure[measure] || {};
            const axis = dataForMeasure.axis || {};
            const opData = axis[operation] || {
                sum: 0,
                count: 0
            }; 

            let sum = 0.0;
            let count = 0;
            let values = dataForMeasure.values || [];
            stats[statKey].values.forEach((point) => {
                if (point.timestamp > end || point.timestamp < start) {
                    return;
                }
                const yValue = _.round(measure.includes('duration') ? point.value[measure] / 1e6 : point.value[measure], 2);
                sum += yValue;
                count++;
                values.push({
                    x: new Date(point.timestamp / 1000),
                    y: yValue,
                    operation: operation
                })
            });

            opData.sum += sum;
            opData.count += count;
            axis[operation] = opData;

            dataForMeasure.values = values;
            dataForMeasure.axis = axis;
            dataByMeasure[measure] = dataForMeasure;
        })

        return dataByMeasure;
    }

    componentDidMount() {
        const dataByMeasure = this.computeDataByMeasure(this.props);
        this.setState({dataByMeasure})
    }

    componentWillReceiveProps(nextProps) {
        const dataByMeasure = this.computeDataByMeasure(nextProps);
        this.setState({dataByMeasure})
    }

    handleTabChange = ( { target } ) => {
        this.setState({
          currentTabKey: target.value,
        });
    };

    onRow = (record, index) => {
        return {
            onClick: this.handleRowClick(record)
        }
    }

    handleRowClick = (record) => () => {
        this.props.history.push('/services?env=none' +
            '&service=' + this.props.selectedService +
            '&operation=' + record.op +
            '&start=' + (this.props.start)  +
            '&end=' + (this.props.end))
    }

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
              selectedOps: {...this.state.selectedOps, [this.state.currentPage]: selectedRowKeys}
          })
        },
    };

    render() {
        const measure = this.state.currentTabKey;

        const scale = {
            x: {
              type: 'time',
              mask: 'HH:mm:ss',
              tickCount: 4
            }
        }

        const columns = [
            {
              title: 'Operation',
              dataIndex: 'op',
              key: 'op',
              width: 240,
            },
            {
              title: 'Average ' + getReadableMeasure(measure),
              dataIndex: 'avg',
              key: 'avg',
              width: 140,
              render: text => measure.includes('duration') ? formatDuration(text, 'milliseconds') : text
            }
        ]
        const dataByMeasure = this.state.dataByMeasure;

        let ops = []
        if (dataByMeasure[measure]) {
            Object.keys(dataByMeasure[measure].axis).forEach((op) => {
                const opData = dataByMeasure[measure].axis[op];
                if (opData.count === 0) {
                    return;
                }
                ops.push({
                    op,
                    avg: _.round(opData.count > 0 ? opData.sum / opData.count : 0, 2)
                });
            })
            
            ops = ops.sort((a, b) => {
                return b.avg - a.avg;
            });
        }

        const start = (this.state.currentPage - 1) * PAGE_SIZE;
        const end = this.state.currentPage * PAGE_SIZE;
        const currentPageOps = ops.slice(start, end).map((opData) => opData.op);
        const currentPageSelection = this.state.selectedOps[this.state.currentPage]
        const data = dataByMeasure[measure] ? dataByMeasure[measure].values.filter((point) => {
            const filtered  = currentPageOps.includes(point.operation) &&
                ( currentPageSelection && currentPageSelection.length > 0 ?
                    currentPageSelection.includes(point.operation) : true);
            return filtered;
        }) : null;

        if (data === null || data.length === 0) {
            return null;
        }

        return (
        <Card style={{margin: '1rem'}} bordered={false} bodyStyle={{ padding: 0 }} title={'Operations'}
            extra={
                <div>
                    <Radio.Group value={this.state.currentTabKey} onChange={this.handleTabChange}>
                        {
                            ['hits', 'duration', 'errors'].map((measure) =>
                                <Radio.Button key={measure} value={measure}>
                                    {getReadableMeasure(measure)}
                                </Radio.Button>
                            )
                        }
                    </Radio.Group>
                </div>
            }
        >
            <Row>
            <Col span={12} style={{padding: '24px'}}>
                { data && data.length > 0 ?
                <Chart
                    width={400}
                    height={250}
                    scale={scale}
                    data={data}
                    padding={[20, 20, 50, measure.includes('duration') ? 60 : 40]}>
                    <Axis name="x" />
                    <Axis name="y" label={{formatter: val => {
                        if (measure.includes('duration')) {
                            return formatDuration(val, 'milliseconds');
                        } else {
                            return val;
                        }
                    }}} />
                    <Geom type="line" position={"x*y"} color={'operation'} size={1} />
                    <Tooltip inPlot={true} position={'right'} />
                </Chart> : undefined }
            </Col>
            <Col span={12} style={{padding: '24px'}}>
                { data && data.length > 0 ?
                <Table
                    rowSelection={this.rowSelection}
                    onRow={this.onRow}
                    rowKey={record => record.op}
                    size="small"
                    bordered={false}
                    columns={columns}
                    dataSource={ops}
                    onChange={({ current }) => this.setState({currentPage: current})}
                    pagination={{
                        position: 'top',
                        style: { marginBottom: 10 },
                        pageSize: PAGE_SIZE,
                    }}
                    scroll={{y: 200}}
                /> : undefined }
            </Col>
            </Row>
        </Card>
        );
    }
}
  
const stateStatXformer = getLastXformCacher(stateStat => {
    const { loading: loadingStats, error: statsError, ...stats } = stateStat;
    return { stats, loadingStats, statsError };
});
  
function mapStateToProps(state) {
    const {
        service,
        start: queryStart,
        end: queryEnd,
        operation,
      } = queryString.parse(state.router.location.search);

    const { stats } =  stateStatXformer(state.stat);
    const lastSearch = store.get('lastSearch');
    let lastSearchService;
    let lastSearchOperation;
    let lastStart, lastEnd;

    if (lastSearch) {
        // last search is only valid if the service is in the list of services
        const { operation: lastOp, service: lastSvc, start, end } = lastSearch;
        lastStart = start;
        lastEnd = end;
        if (lastSvc && lastSvc !== '-') {
            if (state.services.services && state.services.services.includes(lastSvc)) {
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
        stats,
    };
}
  
export default connect(mapStateToProps)(withRouter(ServiceBreakupImpl));