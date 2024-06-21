import React, { useEffect } from 'react'
import { Button, Input, Switch, Popconfirm, Tooltip } from 'antd'

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
      <Button
        className={classes.Button}
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
          <Button danger style={{ marginLeft: '10px' }} disabled={checked.length === 0}>
            Delete
          </Button>
        </Tooltip>
      </Popconfirm>

      <Search
        placeholder='search name'
        allowClear
        onSearch={searchHandler}
        style={{ width: 160, marginLeft: '20px' }}
        defaultValue={props.searchDefValue}
      />
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
