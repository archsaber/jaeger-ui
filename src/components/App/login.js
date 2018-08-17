import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import ArchLogo from './logo';
import Login from 'ant-design-pro/lib/Login';
import { Alert, Row, Col, Layout, Tabs, Button, Carousel } from 'antd';
import ArchRegister from './register';
import { REGISTRATION_SUCCESS, REGISTRATION_FAILURE, REGISTRATION_INIT } from '../../reducers/auth';
import 'devicon/devicon.css';
import './login.css';
import RichData from '../../img/service-breakup.png';
import UncoverErrors from '../../img/uncover-errors.png';
import DistTracing from '../../img/distributed-tracing.png';
import { ConnectedServicePage } from './loadable';

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
          ConnectedServicePage.preload();
        }
    }

    onTabChange = tab => {
      this.setState({ tab });
    }

    render() {
      return (
        <Layout>
        <Header>
          <div style={{textAlign: 'center'}}>
            <ArchLogo />
          </div>
        </Header>
        {/* <div style={{backgroundImage: `url(${RichData})`, height: '100%'}}> */}
        <Content>
          <MediaQuery maxDeviceWidth={480}>
            <Row style={{marginTop: '40px'}} className="supported-languages" >
              <Col style={{textAlign: 'center'}}>
                <i className="devicon-python-plain" title="Python" />
                <i className="devicon-java-plain" title="Java" />
                <i className="devicon-ruby-plain" title="Ruby" /> 
                <i className="devicon-go-plain" title="Go" />
              </Col>
            </Row>
            <Row style={{marginTop: '30px'}} className="supported-languages" >
              <Col style={{textAlign: 'center'}}>
                <i className="devicon-nodejs-plain" title="Node.JS" />
                <i className="devicon-cplusplus-plain" title="C++" />
                <i className="devicon-csharp-plain" title="C#" />
              </Col>
            </Row>
          </MediaQuery>
          <MediaQuery minDeviceWidth={480}>
            <Row style={{marginTop: '40px'}} className="supported-languages" >
              <Col style={{textAlign: 'center'}}>
                <i className="devicon-python-plain" title="Python" />
                <i className="devicon-java-plain" title="Java" />
                <i className="devicon-ruby-plain" title="Ruby" /> 
                <i className="devicon-go-plain" title="Go" />
                <i className="devicon-nodejs-plain" title="Node.JS" />
                <i className="devicon-cplusplus-plain" title="C++" />
                <i className="devicon-csharp-plain" title="C#" />
              </Col>
            </Row>
          </MediaQuery>
          <Row style={{marginTop: '30px'}} >
            <Col style={{textAlign: 'center'}}>
              <Button target="_blank" href="https://doc.archsaber.com/apm/overview.html" type="primary" ghost>
                Quick Start Docs
              </Button>
            </Col>
          </Row>
          <MediaQuery maxDeviceWidth={1024}>
            <Row style={{marginTop: '40px', textAlign: 'center'}} >
              <Carousel autoplay effect={'fade'}>
                <div>
                  <h3>Rich Performance Data</h3>
                  <img src={RichData} style={{display: 'inline', width: '90%'}} alt="presentation" />
                </div>
                <div>
                  <h3>Uncover Application Errors</h3>
                  <img src={UncoverErrors} style={{display: 'inline', width: '90%'}} alt="presentation" />
                </div>
                <div>
                  <h3>Distributed Tracing</h3>
                  <img src={DistTracing} style={{display: 'inline', width: '90%'}} alt="presentation" />
                </div>
              </Carousel>
            </Row>
          </MediaQuery>
          <MediaQuery minDeviceWidth={1025}>
            <Row style={{marginTop: '80px'}}>
              <Col span={14} style={{textAlign: 'center'}}>
                <Carousel autoplay effect={'fade'}>
                  <div>
                    <h3 style={{color: 'rgba(0, 0, 0, 0.65)', padding: 12, fontWeight: 'initial'}}>
                        Rich Performance Data
                    </h3>
                    <img src={RichData} style={{display: 'inline', opacity:0.9}} width={640} alt="presentation" />
                  </div>
                  <div>
                    <h3 style={{color: 'rgba(0, 0, 0, 0.65)', padding: 12, fontWeight: 'initial'}}>
                        Uncover Application Errors
                    </h3>
                    <img src={UncoverErrors} style={{display: 'inline', opacity:0.9}} width={640} alt="presentation" />
                  </div>
                  <div>
                    <h3 style={{color: 'rgba(0, 0, 0, 0.65)', padding: 12, fontWeight: 'initial'}}>
                        Distributed Tracing
                    </h3>
                    <img src={DistTracing} style={{display: 'inline', opacity:0.9}} width={640} alt="presentation" />
                  </div>
                </Carousel>
              </Col>
              <Col span={8}>
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
                      <UserName name="username" placeholder="email" rules={[{
                          required: true,
                          message: 'Please enter email!',
                        }]}
                      />
                      <Password name="password" placeholder="password" />
                      <Submit style={{width: '100%'}}>Login</Submit>
                    </Login>
                  </TabPane>
                  <TabPane key="register" tab="New User">
                    <ArchRegister visible={this.state.tab === 'register'}
                                  registerError={this.props.register === REGISTRATION_FAILURE }/>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </MediaQuery>
        </Content>
        {/* </div> */}
        </Layout>
      );
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
