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

import React from 'react';
import { Dropdown, Icon, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import TraceIDSearchInput from './TraceIDSearchInput';
import { getConfigValue } from '../../utils/config/get-config';
import prefixUrl from '../../utils/prefix-url';

import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import connect from 'react-redux/lib/connect/connect';
import PropTypes from 'prop-types';
import ArchLogo from './logo';
import { USER_INFO_FETCHED, USER_INFO_ERROR } from '../../reducers/user';

const NAV_LINKS = [
  {
    to: prefixUrl('/services'),
    text: 'Services',
  },
  {
    to: prefixUrl('/search'),
    text: 'Traces',
  },
  {
    to: prefixUrl('/alerts'),
    text: 'Alerts',
  },
  {
    to: prefixUrl('/alertrules'),
    text: 'Alert Rules',
  }
];

if (getConfigValue('dependencies.menuEnabled')) {
  NAV_LINKS.push({
    to: prefixUrl('/dependencies'),
    text: 'Dependencies',
  });
}

function AccountNavDropDown({ label, items, license }) {
  const menuItems = (
    <Menu>
      {items.map(item => {
        const { label: itemLabel, url } = item;
        return (
          <Menu.Item key={itemLabel}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {itemLabel}
            </a>
          </Menu.Item>
        );
      })}
      {
        license && (
          <Menu.Item key={'license'}>
            <CopyToClipboard text={license}>
              <span>Click to Copy License</span>
            </CopyToClipboard>
          </Menu.Item>
        )
      }
    </Menu>
  );
  return (
    <Dropdown overlay={menuItems} placement="bottomRight">
      <a>
        {label} <Icon type="down" />
      </a>
    </Dropdown>
  );
}

class TopNavView extends React.Component {

  componentWillMount() {
    this.props.userInfo();
  }

  render() {
    const { activeKey, menuConfig } = this.props;
    const menuItems = Array.isArray(menuConfig) ? menuConfig : [];
    return (
      <div>
        <Menu theme="dark" mode="horizontal" selectable={false} className="ub-right" selectedKeys={[activeKey]}>
          {menuItems.map(item => {
            if (item.items) {
              return (
                <Menu.Item key={item.label}>
                  <AccountNavDropDown key={item.label} {...item} license={
                    this.props.user.info_status === USER_INFO_FETCHED && this.props.user.info.license} />
                </Menu.Item>
              );
            }
            return (
              <Menu.Item key={item.label}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </Menu.Item>
            );
          })}
        </Menu>
        <Menu onClick={this.props.logout} theme="dark" mode="horizontal" selectable={false} selectedKeys={[activeKey]} className="ub-right">
          <Menu.Item>
            Logout
          </Menu.Item>
        </Menu>
        <Menu theme="dark" mode="horizontal" selectable={false} selectedKeys={[activeKey]}>
          <Menu.Item>
            <Link to={prefixUrl('/')}><ArchLogo /></Link>
          </Menu.Item>
          <Menu.Item>
            <TraceIDSearchInput />
          </Menu.Item>
          {NAV_LINKS.map(({ to, text }) => (
            <Menu.Item key={to}>
              <Link to={to}>{text}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>
    );
  }
}

TopNavView.propTypes = {
  userInfo: PropTypes.func,
  logout: PropTypes.func
}

TopNavView.defaultProps = {
  menuConfig: [],
};

TopNavView.AccountNavDropDown = AccountNavDropDown;

export const TopNav = connect((state) => {
  return {
    user: state.user
  }
}, (dispatch) => {
  const { logout, userInfo } = bindActionCreators(jaegerApiActions, dispatch);
  return { logout, userInfo };
})(TopNavView);
