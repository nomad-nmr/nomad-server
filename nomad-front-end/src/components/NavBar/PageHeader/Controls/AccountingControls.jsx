import React from 'react'
import { Button, Space } from 'antd'

import classes from '../PageHeader.module.css'

const AccountingControls = props => {
  return (
    <Space className={classes.ExtraContainer}>
      <Button className={classes.Button} type='primary' onClick={() => props.toggleCostDrawer()}>
        Costing for Instruments
      </Button>
      {props.type === 'Grants' && (
        <Button type='primary' onClick={() => props.toggleGrantForm()} disabled={props.formVisible}>
          Add Grant
        </Button>
      )}
    </Space>
  )
}

export default AccountingControls
