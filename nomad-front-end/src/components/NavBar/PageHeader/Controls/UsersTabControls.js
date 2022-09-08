import React, { useEffect } from 'react'
import { Button, Input, Switch } from 'antd'

import classes from '../PageHeader.module.css'

const UsersTabControls = props => {
  const { Search } = Input
  const { query, searchHandler } = props

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
