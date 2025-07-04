import React, { useState } from 'react'
import { Button, Modal, Switch, Space } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'

import classes from '../PageHeader.module.css'

const { confirm } = Modal

const ClaimControls = props => {
  const { checked, showArchived, claimId, groupId, token, fetchUserList, accessLevel } = props

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
              //here, also load the relevant users if user is admin
              if (accessLevel === 'admin') {
                fetchUserList(token, groupId, false)
              }
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
