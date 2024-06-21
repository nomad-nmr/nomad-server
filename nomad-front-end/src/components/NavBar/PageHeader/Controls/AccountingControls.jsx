import React from 'react'
import { Button, Space, Divider } from 'antd'

import classes from '../PageHeader.module.css'

const AccountingControls = props => {
  const { setGrantsVisible } = props
  return (
    <Space className={classes.ExtraContainer}>
      <Button className={classes.Button} type='primary' onClick={() => props.toggleCostDrawer()}>
        Set Instruments Costing
      </Button>
      <Divider type='vertical' />
      <Button type={!setGrantsVisible && 'primary'} onClick={() => props.toggleSetGrants()}>
        {setGrantsVisible ? 'Close & Return' : 'Set Grants'}
      </Button>
      {setGrantsVisible && (
        <Button type='primary' onClick={() => props.toggleAddGrant()}>
          Add Grant
        </Button>
      )}
    </Space>
  )
}

export default AccountingControls
