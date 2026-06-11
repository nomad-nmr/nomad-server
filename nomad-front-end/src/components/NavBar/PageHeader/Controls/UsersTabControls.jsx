import React, { useEffect } from 'react'
import { Button, Input, Switch, Popconfirm, Tooltip, Space } from 'antd'

import classes from '../PageHeader.module.css'

const UsersTabControls = props => {
  const { Search } = Input
  const { query, searchHandler, checked, deleteHandler, token } = props

  //Hook triggers search if redirected from status table with query
  useEffect(() => {
    if (query) {
      searchHandler(query)
    }
  }, [query, searchHandler])

  return (
    <div className={classes.ExtraContainer}>
      <Space size='large'>
        <Button
          type='primary'
          onClick={() => {
            props.toggleDrawer(false)
          }}
        >
          Add
        </Button>
        <Popconfirm
          title='Delete users'
          description={
            <div>
              <p>
                Are you sure you want to delete {checked.length}{' '}
                {checked.length === 1 ? 'user' : 'users'} ?
              </p>
              <p>Users with acquired experiments will be set inactive.</p>
            </div>
          }
          onConfirm={() => deleteHandler(checked, token)}
        >
          <Tooltip title='Delete checked users'>
            <Button danger disabled={checked.length === 0}>
              Delete
            </Button>
          </Tooltip>
        </Popconfirm>

        <Search
          placeholder='search name'
          allowClear
          onSearch={searchHandler}
          style={{ width: 160, marginTop: '16px', marginRight: '25px' }}
          defaultValue={props.searchDefValue}
        />
      </Space>

      <div className={classes.SwitchElement}>
        <label>Show Inactive</label>
        <Switch
          size='small'
          checked={props.showInactive}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={props.switchShowInactive}
        />
      </div>
    </div>
  )
}

export default UsersTabControls
