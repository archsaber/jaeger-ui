import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Form, Input, Button, Popover, Progress, Icon, Alert } from 'antd';

const FormItem = Form.Item;

const passwordStatusMap = {
    good: <div style={{color: 'green'}}>ok</div>,
    ok: <div style={{color: 'orange'}}>pass</div>,
    poor: <div style={{color: 'red'}}>poor</div>,
};

const passwordProgressMap = {
  good: 'success',
  ok: 'normal',
  poor: 'exception',
};

class RegisterView extends Component {
  state = {
    confirmDirty: false,
    visible: false,
    help: '',
    registerError: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.registerError !== this.props.registerError) {
      this.setState({
        registerError: nextProps.registerError
      });
    }
  }

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'good';
    }
    if (value && value.length > 5) {
      return 'ok';
    }
    return 'poor';
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
          this.props.register(values);
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Passwords don\'t match');
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: 'Please enter the password!',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
            {this.state.registerError && <Alert
              message="Unable to register. Please try back after some time."
              type="error" closable style={{marginBottom: '24px'}}/>}
            <Form onSubmit={this.handleSubmit}>
                <FormItem>
                    {getFieldDecorator('username', {
                    rules: [
                        {
                        required: true,
                        message: 'Please enter a username!',
                        },
                    ],
                    })(<Input size="large" placeholder="username"
                              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('mailid', {
                    rules: [
                        {
                        required: true,
                        message: 'Please enter an email address!',
                        },
                        {
                        type: 'email',
                        message: 'Email address format is wrong!',
                        },
                    ],
                    })(<Input size="large" placeholder="email"
                              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      />)}
                </FormItem>
                <FormItem help={this.state.help}>
                    <Popover
                      content={
                          <div style={{ padding: '4px 0' }}>
                          {passwordStatusMap[this.getPasswordStatus()]}
                          {this.renderPasswordProgress()}
                          <div style={{ marginTop: 10 }}>
                              Please enter at least 6 characters.
                          </div>
                          </div>
                      }
                      overlayStyle={{ width: 240 }}
                      placement="right"
                      visible={this.state.visible && this.props.visible}
                    >
                    {getFieldDecorator('password', {
                        rules: [
                        {
                            validator: this.checkPassword,
                        },
                        ],
                    })(<Input size="large" type="password" placeholder="password - at least 6 characters"
                              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      />)}
                    </Popover>
                </FormItem>
                <FormItem>
                    {getFieldDecorator('confirm', {
                    rules: [
                        {
                        required: true,
                        message: 'Please confirm your password!',
                        },
                        {
                        validator: this.checkConfirm,
                        },
                    ],
                    })(<Input size="large" type="password" placeholder="confirm password"
                              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      />)}
                </FormItem>
                <FormItem>
                    <Button
                    size="large"
                    loading={submitting}
                    style={{width: '100%', marginTop: '24px'}}
                    type="primary"
                    htmlType="submit"
                    >
                    Register
                    </Button>
                </FormItem>
            </Form>
        </div>
    );
  }
}

RegisterView.propTypes = {
    login: PropTypes.func,
}

function mapDispatchToProps(dispatch) {
    const { register } = bindActionCreators(jaegerApiActions, dispatch);
    return { register };
}

export default connect(null, mapDispatchToProps)(Form.create()(RegisterView));