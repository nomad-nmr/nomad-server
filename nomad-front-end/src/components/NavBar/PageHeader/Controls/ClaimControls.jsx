import React, { useState } from 'react'
import { Button, Modal, Switch, Space } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'

import classes from '../PageHeader.module.css'

const { confirm } = Modal

const ClaimControls = props => {

  const { checked, showArchived, claimId } = props

  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.SwitchElement}>
        <label>Show Archived</label>
        <Switch
          size='small'
          checked={showArchived}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={() => props.showArchivedHandler()}
        />
      </div>
      <div style={{ marginLeft: '30px' }}>
        <Button
          disabled={checked.length === 0 || claimId ? true : false}
          type='primary'
          onClick={() => {
      {
              props.toggleModal()
              // props.submitClaimHandler(token, { userId, instrumentId, expsArr })
            }
          }}
        >
          Claim Selected
        </Button>
      </div>
    </div>
  )
}

export default ClaimControls
