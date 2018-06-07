import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

export const NewAlertFormImpl = Form.create()(
  class extends React.Component {
    constructor(props) {
        super(props);
        this.selectService = this.selectService.bind(this);
        this.state = {
            selectedService: null,
        };
      }

    selectService(serviceName) {
        this.setState({selectedService: serviceName});
        this.props.fetchServiceOperations(serviceName);
    }

    render() {
      const { visible, onCancel, onCreate, form, services } = this.props;
      const { getFieldDecorator } = form;
      const selectedServicePayload = services.find(s => s.name === this.state.selectedService);
      const opsForSvc = (selectedServicePayload && selectedServicePayload.operations) || [];

      return (
        <Modal
          visible={visible}
          title="New Alert Rule"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="Service Name">
              {getFieldDecorator('Service')(
                <Select showSearch required={true} clearable={false}
                    onChange={this.selectService}>
                    {
                        services.map(v => <Option key={v.name} value={v.name}>{v.name}</Option>)
                    }
                </Select>
              )}
            </FormItem>
            <FormItem label="Operation Name">
              {getFieldDecorator('Operation')(
                <Select showSearch required={true} clearable={false}>
                {
                    ['none'].concat(opsForSvc).map(v => <Option key={v} value={v}>{v}</Option>)
                }
                </Select>
                )}
            </FormItem>
            <FormItem label="Condition">
                <Row gutter={8}>
                    <Col span={4}>
                    {getFieldDecorator('Function', {
                        initialValue: 'avg',
                    })(
                        <Select>
                            <Option value='avg'>Avg</Option>
                            <Option value='min'>Min</Option>
                            <Option value='max'>Max</Option>
                        </Select>
                    )}
                    </Col>
                    <Col span={6}>
                    {getFieldDecorator('Measure', {
                        initialValue: 'hits',
                    })(
                        <Select>
                            <Option value='hits'>Hits</Option>
                            <Option value='duration'>Duration</Option>
                            <Option value='errors'>Errors</Option>
                        </Select>
                    )}
                    </Col>
                    <Col span={2}>
                    {getFieldDecorator('Upper', {
                        initialValue: 'true',
                    })(
                        <Select>
                            <Option value='true'>{"<"}</Option>
                            <Option value='false'>{">"}</Option>
                        </Select>
                    )}
                    </Col>
                    <Col span={4}>
                    {getFieldDecorator('Limit', {
                        rules: [{ required: true, message: 'Please enter threshold value!' }],
                    })(
                        <Input />
                    )}
                    </Col>
                    <Col span={2}>
                        over
                    </Col>
                    <Col span={4}>
                    {getFieldDecorator('Duration', {
                        rules: [{ required: true, message: 'Please input the window duration!' }],
                    })(
                        <Input />
                    )}
                    </Col>
                    <Col span={2}>
                        mins
                    </Col>
                </Row>
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

function mapDispatchToProps(dispatch) {
    const { fetchServiceOperations } = bindActionCreators(jaegerApiActions, dispatch);
    return { fetchServiceOperations };
}

export const NewAlertForm = connect(null, mapDispatchToProps)(NewAlertFormImpl);