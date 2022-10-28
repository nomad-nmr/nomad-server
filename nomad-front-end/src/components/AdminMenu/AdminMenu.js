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
} from '@ant-design/icons'

const AdminMenu = props => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleClick = e => navigate(e.key)

  const items = [
    {
      key: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />
    },
    {
      key: 'user management',
      label: 'User Management',
      icon: <TeamOutlined />,
      children: [
        {
          key: '/admin/users',
          label: 'Manage Users',
          icon: <UserOutlined />
        },
        {
          key: '/admin/groups',
          label: 'Manage Groups',
          icon: <TeamOutlined />
        },
        {
          key: '/admin/message',
          label: 'Send Message',
          icon: <MailOutlined />
        }
      ]
    },
    {
      key: 'usage',
      label: 'Usage Statistics',
      icon: <BarChartOutlined />,
      children: [
        {
          key: '/admin/history',
          label: 'Experiment History',
          icon: <HistoryOutlined />
        },
        {
          key: '/admin/accounts',
          label: 'Accounting',
          icon: <PoundOutlined />
        }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      children: [
        {
          key: '/admin/instruments',
          label: 'Instruments',
          icon: <DeploymentUnitOutlined />
        },
        {
          key: '/admin/parameter-sets',
          label: 'Parameter Sets',
          icon: <ExperimentOutlined />
        }
      ]
    }
  ]

  return (
    <nav>
      <Logo collapsed={props.collapsed} />

      <Menu
        onClick={handleClick}
        theme='dark'
        mode='inline'
        defaultSelectedKeys={['/dashboard']}
        selectedKeys={[location.pathname]}
        items={items}
      />
    </nav>
  )
}

export default AdminMenu
