import Form from './form';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Box, Flex } from 'reflexbox';
import ArchLogo from './logo';

function mapDispatchToProps(dispatch) {
    const { login } = bindActionCreators(
        jaegerApiActions,
        dispatch
      );
      return {
          login
      };
}

function giveStringChange(handler) {
    return (event) => handler(event.target.value);
}

class LoginView extends Component {
    state = {
        validPass: true,
        validMailId: true,
    };

    pass = '';
    mailid = '';

    handlePassChange = giveStringChange(pass => (this.pass = pass));

    handleMailIdChange = giveStringChange(mailid => (this.mailid = mailid));

    handleLoginTry = event => {
        event.preventDefault();
        event.stopPropagation();
        this.props.login(this.mailid, this.pass);
    };

    handleLoginSubmit = () => {
        this.props.login(this.mailid, this.pass);
    };

    render() {
        const { validPass, validMailId } = this.state;
        const domTree = (
            <div>
                <Flex align="center" column={true}>
                    <Box auto={true} py={1} px={1} w={1} />
                    <Box auto={true} py={6} px={1} my={2} w={'30em'}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#f5f5f5', fontFamily: 'Neuropol-Regular' }}>
                                <ArchLogo />
                            </h2>
                        </div>

                        <Box auto={true} py={1} px={0} />
                        <Box auto={true} py={1} px={30}>
                            <Form id="chat" action="#" onSubmit={this.handleLoginSubmit}>
                                <div className="pt-control-group pt-vertical as-login-from">
                                    <div className="pt-input-group pt-large">
                                        <input
                                            style={{width: '100%'}}
                                            type="text"
                                            className="pt-input"
                                            placeholder="Email"
                                            onChange={this.handleMailIdChange}
                                        />
                                    </div>
                                    <div className="pt-input-group pt-large">
                                        <span className="pt-icon pt-icon-key" />
                                        <input
                                            style={{width: '100%'}}
                                            type="password"
                                            className="pt-input"
                                            placeholder="Password"
                                            onChange={this.handlePassChange}
                                        />
                                    </div>
                                    <button
                                        style={{width: '100%'}}
                                        className="pt-button pt-large pt-intent-primary"
                                        onClick={this.handleLoginTry}
                                        disabled={!validPass || !validMailId}
                                    >
                                        <b>Login</b>
                                    </button>
                                </div>
                            </Form>
                        </Box>
                    </Box>
                </Flex>
            </div>
        );

        return domTree;
    }
}

LoginView.propTypes = {
    login: PropTypes.func,
}

export const Login = connect(null, mapDispatchToProps)(LoginView);
