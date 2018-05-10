// @flow

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
import { Layout } from 'antd';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { TopNav } from './TopNav';
import { trackPageView } from '../../utils/tracking';
import './Page.css';
import { Login } from './login'

const { Header, Content } = Layout;

// export for tests
export class PageImpl extends React.Component {

  componentDidMount() {
    const { pathname, search } = this.props.location;
    trackPageView(pathname, search);
  }

  componentWillReceiveProps(nextProps) {
    const { pathname, search } = this.props.location;
    const { pathname: nextPathname, search: nextSearch } = nextProps.location;
    if (pathname !== nextPathname || search !== nextSearch) {
      trackPageView(nextPathname, nextSearch);
    }
  }

  render() {
    const { children, config, location, auth } = this.props;
    const menu = config && config.menu;

    const loggedIn = (
        <div>
        <Helmet title="Jaeger UI" />
        <Layout>
          <Header className="Page--topNav">
            <TopNav activeKey={location.pathname} menuConfig={menu} />
          </Header>
          <Content className="Page--content">{children}</Content>
        </Layout>
      </div>
    )

    if (auth.login_status === 'LOGGED_IN') {
      return loggedIn;
    } else {
      return <Login/>
    }
  }
}

// export for tests
export function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
    config: state.config,
    location: state.router.location,
    auth: state.auth,
  };
}

export default withRouter(connect(mapStateToProps)(PageImpl));
