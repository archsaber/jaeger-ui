import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ArchLogo from './logo';
import Login from 'ant-design-pro/lib/Login';
import { Alert, Row, Col, Layout, Tabs } from 'antd';
import ArchRegister from './register';
import { REGISTRATION_SUCCESS, REGISTRATION_FAILURE, REGISTRATION_INIT } from '../../reducers/auth';

const { UserName, Password, Submit } = Login;
const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;


class LoginView extends Component {
    state = {
        notice: '',
        tab: 'login'
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.register !== nextProps.register) {
        this.setState({
          tab: (nextProps.register === REGISTRATION_INIT ||
            nextProps.register === REGISTRATION_SUCCESS) ? "login" : "register"
        })
      }
    }
    
    onSubmit = (err, values) => {
        if (!err) {
          this.props.login(values.username, values.password);
        }
    }

    onTabChange = tab => {
      this.setState({ tab });
    }

    render() {
        const loggedOut = (
            <Layout>
            <Header>
              <div style={{textAlign: 'center'}}>
                <ArchLogo />
              </div>
            </Header>
            <Content>
              <Row style={{marginTop: '80px'}}>
                <Col span={8} offset={8} >
                  <Tabs
                    animated={false}
                    activeKey={this.state.tab}
                    onChange={this.onTabChange}
                  >
                    <TabPane key="login" tab="Existing User">
                      {this.props.register === REGISTRATION_SUCCESS && <Alert
                        message="Registration successful. Please go to the verification link in your inbox."
                        type="success" closable style={{marginBottom: '24px'}}/>}
                      <Login
                      onSubmit={this.onSubmit}
                      defaultActiveKey={this.state.tab} onTabChange={this.onTabChange}
                      >
                        {
                          this.state.notice &&
                          <Alert style={{ marginBottom: 24 }} message={this.state.notice} type="error" showIcon closable />
                        }
                        <UserName name="username" placeholder="username" />
                        <Password name="password" placeholder="password" />
                        <Submit>Login</Submit>
                      </Login>
                    </TabPane>
                    <TabPane key="register" tab="New User">
                      <ArchRegister visible={this.state.tab === 'register'}
                                    registerError={this.props.register === REGISTRATION_FAILURE }/>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </Content>
            </Layout>
          )

        return loggedOut;
    }
}

LoginView.propTypes = {
    login: PropTypes.func,
}

function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
    register: state.auth.register_status,
  };
}

function mapDispatchToProps(dispatch) {
    const { login } = bindActionCreators(jaegerApiActions, dispatch);
    return { login };
}

export const ArchLogin = connect(mapStateToProps, mapDispatchToProps)(LoginView);
