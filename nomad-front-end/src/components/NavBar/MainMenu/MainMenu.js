import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'

import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import batchSubmitIcon from '../../../assets/batch-submit.png'

import classes from './MainMenu.module.css'

const MainMenu = props => {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessLevel } = props

  const items = []

  if (process.env.REACT_APP_SUBMIT_ON === 'true' && props.username) {
    items.push({
      key: '/submit',
      label: <span className={classes.MenuItem}>Book New Job</span>,
      icon: <DownloadOutlined style={{ fontSize: 20 }} />
    })
  }

  if (
    process.env.REACT_APP_BATCH_SUBMIT_ON === 'true' &&
    (accessLevel === 'admin' || accessLevel === 'admin-b')
  ) {
    items.push({
      key: '/batch-submit',
      label: <span className={classes.MenuItem}>Batch Submit</span>,
      icon: (
        <img
          src={batchSubmitIcon}
          style={{ width: '30px', height: '30px', marginBottom: '8px' }}
          alt='batch-submit icon'
        />
      )
    })
  }

  if (process.env.REACT_APP_DATASTORE_ON === 'true' && props.username) {
    items.push({
      key: '/search',
      icon: <SearchOutlined style={{ fontSize: 20 }} />,
      label: 'Search'
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
