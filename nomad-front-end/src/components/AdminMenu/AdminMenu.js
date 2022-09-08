import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import Logo from './Logo/Logo'
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  HistoryOutlined,
  PoundOutlined,
  SettingOutlined,
  ExperimentOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined,
  MailOutlined
  // BankOutlined
} from '@ant-design/icons'

const { SubMenu } = Menu

const AdminMenu = props => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleClick = e => navigate(e.key)

  return (
    <nav>
      <Logo collapsed={props.collapsed} />

      <Menu
        onClick={handleClick}
        theme='dark'
        mode='inline'
        defaultSelectedKeys={['/dashboard']}
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key='/dashboard'>
          <DashboardOutlined />
          <span>Dashboard</span>
        </Menu.Item>
        <SubMenu
          key='user management'
          title={
            <span>
              <TeamOutlined />
              <span>User Management</span>
            </span>
          }
        >
          <Menu.Item key='/admin/users'>
            <UserOutlined />
            <span>Manage Users</span>
          </Menu.Item>
          <Menu.Item key='/admin/groups'>
            <TeamOutlined />
            <span>Manage Groups</span>
          </Menu.Item>
          <Menu.Item key='/admin/message'>
            <MailOutlined />
            <span>Send Message</span>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key='usage'
          title={
            <span>
              <BarChartOutlined />
              <span>Usage Statistics</span>
            </span>
          }
        >
          <Menu.Item key='/admin/history'>
            <HistoryOutlined />
            <span>Experiment History</span>
          </Menu.Item>
          <Menu.Item key='/admin/accounts'>
            <PoundOutlined />
            <span>Accounting</span>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key='settings'
          title={
            <span>
              <SettingOutlined />
              <span>Settings</span>
            </span>
          }
        >
          <Menu.Item key='/admin/instruments'>
            <DeploymentUnitOutlined />
            <span>Instruments</span>
          </Menu.Item>
          <Menu.Item key='/admin/parameter-sets'>
            <ExperimentOutlined />
            <span>Parameter Sets</span>
          </Menu.Item>
          {/*<Menu.Item key='/admin/grants'>
            <BankOutlined />
            <span>Grants</span>
        </Menu.Item>*/}
        </SubMenu>
      </Menu>
    </nav>
  )
}

export default AdminMenu
