import React from 'react'
import { Button, Switch, Space } from 'antd'

import classes from '../PageHeader.module.css'

const GroupsTabControls = props => {
  return (
    <div className={classes.ExtraContainer}>
      <Space size='large'>
        <Button
          className={classes.Button}
          type='primary'
          onClick={() => props.formHandler(false)}
          disabled={props.formVisible}
        >
          Add
        </Button>
        <div className={classes.SwitchElement}>
          <label>Show Inactive</label>
          <Switch
            size='small'
            checked={props.showInactive}
            checkedChildren='On'
            unCheckedChildren='Off'
            onChange={props.toggleShowInactive}
          />
        </div>
      </Space>
    </div>
  )
}

export default GroupsTabControls
