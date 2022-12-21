import React from 'react'
import { Button } from 'antd'

import classes from '../PageHeader.module.css'

const AccountingControls = props => {
  return (
    <div className={classes.ExtraContainer}>
      <Button className={classes.Button} type='primary' onClick={() => props.toggleDrawer()}>
        Costing for Instruments
      </Button>
    </div>
  )
}

export default AccountingControls
