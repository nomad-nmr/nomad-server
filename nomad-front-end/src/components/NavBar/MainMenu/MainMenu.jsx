import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Menu } from 'antd'

import Icon, {
  SettingOutlined,
  SearchOutlined,
  LineChartOutlined,
  UploadOutlined,
  DatabaseOutlined,
  FolderOutlined,
  FormOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  HistoryOutlined,
  PoundOutlined,
  ExperimentOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined,
  DownCircleOutlined
} from '@ant-design/icons'

import batchIconSvg from './BatchSubmitIcon'
import classes from './MainMenu.module.css'

const MainMenu = props => {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessLevel, manualAccess } = props

  const BatchSubmitIcon = props => <Icon component={batchIconSvg} {...props} />

  const items = []

  if (location.pathname !== '/dashboard' && accessLevel !== 'user-b') {
    items.push({
      key: '/dashboard',
      label: <span className={classes.MenuItem}>Dashboard</span>,
      icon: <DashboardOutlined style={{ fontSize: 20 }} />
    })
  }

  if (
    import.meta.env.VITE_BATCH_SUBMIT_ON === 'true' &&
    accessLevel !== 'user-d' &&
    (location.pathname === '/' || location.pathname === '/dashboard')
  ) {
    items.push({
      key: '/batch-submit/null',
      label: <span className={classes.MenuItem}>Batch Submit</span>,
      icon: <BatchSubmitIcon style={{ fontSize: 20 }} />
    })
  }

  const datastoreChildren = [
    {
      type: 'group',
      label: <span className={classes.MenuItem}>Search</span>,
      children: [
        {
          key: '/search-experiment/null',
          icon: <SearchOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Experiments</span>
        },
        {
          key: '/search-dataset',
          icon: <SearchOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Datasets</span>
        }
      ]
    },
    {
      key: '/collections/list',
      icon: <FolderOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>Collections</span>
    },
    {
      key: '/nmrium/null',
      icon: <LineChartOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>NMRium</span>
    }
  ]

  if (manualAccess || accessLevel === 'admin') {
    datastoreChildren.unshift({
      key: 'sample-manager',
      icon: <FormOutlined style={{ fontSize: 20 }} />,
      label: (
        <a
          href='https://nmr-samples.github.io/online/'
          target='_blank'
          rel='noopener noreferrer'
          style={{ fontSize: '16px', fontWeight: 500, color: 'inherit' }}
          onClick={e => e.stopPropagation()}
        >
          Sample Manager
        </a>
      )
    })
    datastoreChildren.unshift({
      key: '/claim',
      icon: <UploadOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>Manual Claim</span>
    })
  }

  if (import.meta.env.VITE_DATASTORE_ON === 'true' && props.username) {
    items.push({
      key: 'SubMenu',
      icon: <DatabaseOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>Datastore</span>,
      children: datastoreChildren
    })
  }

  const adminMenuItems = [
    {
      type: 'group',
      label: <span className={classes.MenuItem}>User Management</span>,
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Manage Users</span>
        },
        {
          key: '/admin/groups',
          icon: <TeamOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Manage Groups</span>
        },
        {
          key: '/admin/message',
          icon: <MailOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Send Message</span>
        }
      ]
    },
    {
      type: 'group',
      label: <span className={classes.MenuItem}>Usage Statistics</span>,
      children: [
        {
          key: '/admin/history',
          icon: <HistoryOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Experiment History</span>
        },
        {
          key: '/admin/accounts',
          icon: <PoundOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Costs Accounting</span>
        },
        {
          key: '/admin/claims-history',
          icon: <DownCircleOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Manual Claims History</span>
        }
      ]
    },
    {
      type: 'group',
      label: <span className={classes.MenuItem}>Settings</span>,
      children: [
        {
          key: '/admin/instruments',
          icon: <DeploymentUnitOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Instruments</span>
        },
        {
          key: '/admin/parameter-sets',
          icon: <ExperimentOutlined style={{ fontSize: 20 }} />,
          label: <span className={classes.MenuItem}>Parameter Sets</span>
        }
      ]
    }
  ]

  if (accessLevel === 'admin') {
    items.push({
      key: 'SubMenu2',
      icon: <SettingOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>Administration</span>,
      children: adminMenuItems
    })
  }

  return (
    <Menu
      mode='horizontal'
      onClick={e => navigate(e.keyPath[0])}
      selectable={false}
      disabledOverflow={true}
      style={{ marginRight: 30, display: 'flex' }}
      selectedKeys={[location.pathname]}
      items={items}
    />
  )
}

export default MainMenu
