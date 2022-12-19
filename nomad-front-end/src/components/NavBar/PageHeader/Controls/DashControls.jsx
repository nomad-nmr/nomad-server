import React from 'react'
import { Switch } from 'antd'

import StatusButtons from '../StatusButtons/StatusButtons'

import classes from '../PageHeader.module.css'

const DashControls = props => {
  return (
    <div className={classes.ExtraContainer}>
      <div className={classes.SwitchElement}>
        <label>Cards</label>
        <Switch
          size='small'
          checked={props.switchOn}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={props.toggleCards}
        />
      </div>
      <StatusButtons data={props.buttonsData} click={props.onButtonClick} />
    </div>
  )
}

export default DashControls
