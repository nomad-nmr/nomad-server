import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'

import Icon, {
  DownloadOutlined,
  SearchOutlined,
  LineChartOutlined,
  UploadOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import batchIconSvg from './BatchSubmitIcon'

import classes from './MainMenu.module.css'

const MainMenu = props => {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessLevel, manualAccess } = props

  const BatchSubmitIcon = props => <Icon component={batchIconSvg} {...props} />

  const items = []

  if (
    (import.meta.env.VITE_SUBMIT_ON === 'true' &&
      props.username &&
      location.pathname === '/dashboard') ||
    location.pathname.split('/')[1] === 'admin'
  ) {
    items.push({
      key: '/submit',
      label: <span className={classes.MenuItem}>Book New Job</span>,
      icon: <DownloadOutlined style={{ fontSize: 20 }} />
    })
  }

  if (
    (import.meta.env.VITE_BATCH_SUBMIT_ON === 'true' &&
      (accessLevel === 'admin' || accessLevel === 'admin-b' || accessLevel === 'user-b') &&
      location.pathname === '/dashboard') ||
    location.pathname.split('/')[1] === 'admin'
  ) {
    items.push({
      key: '/batch-submit',
      label: <span className={classes.MenuItem}>Batch Submit</span>,
      icon: <BatchSubmitIcon style={{ fontSize: 20 }} />
    })
  }

  const subChildren = [
    {
      key: '/search',
      icon: <SearchOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>Search</span>
    },
    {
      key: '/nmrium/null',
      icon: <LineChartOutlined style={{ fontSize: 20 }} />,
      label: <span className={classes.MenuItem}>NMRium</span>
    }
  ]

  if (manualAccess || accessLevel === 'admin') {
    subChildren.unshift({
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
      children: subChildren
    })
  }

  return (
    <Menu
      mode='horizontal'
      onClick={e => navigate(e.keyPath[0])}
      selectable={false}
      disabledOverflow={true}
      style={{ marginRight: 30 }}
      selectedKeys={[location.pathname]}
      items={items}
    />
  )
}

export default MainMenu
