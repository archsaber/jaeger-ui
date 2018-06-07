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

import TraceIDSearchInput from './TraceIDSearchInput';
import type { ConfigMenuItem, ConfigMenuGroup } from '../../types/config';
import { getConfigValue } from '../../utils/config/get-config';
import prefixUrl from '../../utils/prefix-url';

import * as jaegerApiActions from '../../actions/jaeger-api';
import { bindActionCreators } from 'redux';
import connect from 'react-redux/lib/connect/connect';
import PropTypes from 'prop-types';

function mapDispatchToProps(dispatch) {
  const { logout } = bindActionCreators(
      jaegerApiActions,
      dispatch
    );
    return {
        logout
    };
}

type TopNavProps = {
  activeKey: string,
  menuConfig: (ConfigMenuItem | ConfigMenuGroup)[],
  logout: () => void;
};

const NAV_LINKS = [
  {
    to: prefixUrl('/search'),
    text: 'Search',
  },
  {
    to: prefixUrl('/stats'),
    text: 'Stats',
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

function CustomNavDropdown({ label, items }: ConfigMenuGroup) {
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

function TopNavView(props: TopNavProps) {
  const { activeKey, menuConfig } = props;
  const menuItems = Array.isArray(menuConfig) ? menuConfig : [];
  return (
    <div>
      <Menu theme="dark" mode="horizontal" selectable={false} className="ub-right" selectedKeys={[activeKey]}>
        {menuItems.map(item => {
          if (item.items) {
            return (
              <Menu.Item key={item.label}>
                <CustomNavDropdown key={item.label} {...item} />
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
      <Menu onClick={props.logout} theme="dark" mode="horizontal" selectable={false} selectedKeys={[activeKey]} className="ub-right">
        <Menu.Item>
          Logout
        </Menu.Item>
      </Menu>
      <Menu theme="dark" mode="horizontal" selectable={false} selectedKeys={[activeKey]}>
        <Menu.Item>
          <Link to={prefixUrl('/')}>ArchSaber</Link>
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

TopNavView.propTypes = {
  logout: PropTypes.func,
}

TopNavView.defaultProps = {
  menuConfig: [],
};

TopNavView.CustomNavDropdown = CustomNavDropdown;

export const TopNav = connect(null, mapDispatchToProps)(TopNavView);
