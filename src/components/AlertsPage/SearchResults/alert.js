// @flow

import * as React from 'react';
import { Card, Badge, Tooltip, Icon, Row, Col } from 'antd';
import './alert.css';
import '../SearchForm.css';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { getReadableMeasure } from '../../../utils/stats';

export default class Alert extends React.PureComponent {
  props;

  render() {
    const { serviceName, operationName, openTime, closeTime,
      measure, upper, limit, actualValue, function: mathFunction, duration } = this.props
    const status = closeTime > 0 ?
      'Closed ' + moment.unix(closeTime / 1e6).fromNow() :
      'Opened ' + moment.unix(openTime / 1e6).fromNow()

    const durationMins = duration / 1e6 / 60;
    const formattedActualValue = parseFloat(Math.round(actualValue * 100) / 100).toFixed(2)
    
    return (
      <Row>
        <Col span={12} offset={6}>
      <Tooltip placement={'right'} title={
        <div>
          <Icon type="arrow-up" style={{ color: 'red' }} />
          <span> {moment.unix(openTime / 1e6).format('HH:mm:ss')}</span>
          <br/>
          {
            closeTime > 0 && (
              <div>
                <Icon type="arrow-down" style={{ color: 'green' }} />
                <span> {moment.unix(closeTime / 1e6).format('HH:mm:ss')}</span>
              </div>
            )
          }
        </div>}
      >
        <Link to={
          '/stats?env=none' +
          '&service=' + serviceName +
          '&operation=' + operationName +
          '&start=' + (openTime-duration)  +
          '&end=' + (closeTime > 0 ? closeTime : moment().valueOf() * 1e3)
        }>
          <Card title={serviceName + (operationName !== '' ? ' : ' + operationName : '')}
            style={{width: '500px'}}
            extra={<Badge status={closeTime > 0 ? 'success' : 'error'} text={status} />}>
            <p>
              {mathFunction.toUpperCase() + '('}<b>{getReadableMeasure(measure)}</b>{') over ' + durationMins +
              (durationMins > 1 ? ' minutes' : ' minute') + ' = ' + formattedActualValue +
              ' which is' + (upper ? ' greater than ' : ' less than ') + limit}
            </p>
          </Card>
        </Link>
      </Tooltip>
      </Col>
      </Row>
    )
  }
}