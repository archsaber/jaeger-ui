import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ArchLogo from './logo';
import Login from 'ant-design-pro/lib/Login';
import { Alert, Row, Col, Layout } from 'antd';

const { UserName, Password, Submit } = Login;
const { Header, Content } = Layout;


class LoginView extends Component {
    state = {
        notice: '',
    }
    
    onSubmit = (err, values) => {
        if (!err) {
          this.props.login(values.username, values.password);
        }
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
                  <Login
                    onSubmit={this.onSubmit}
                  >
                    {
                      this.state.notice &&
                      <Alert style={{ marginBottom: 24 }} message={this.state.notice} type="error" showIcon closable />
                    }
                    <UserName name="username" />
                    <Password name="password" />
                    <Submit>Login</Submit>
                  </Login>
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

function mapDispatchToProps(dispatch) {
    const { login } = bindActionCreators(jaegerApiActions, dispatch);
    return { login };
}

export const ArchLogin = connect(null, mapDispatchToProps)(LoginView);
