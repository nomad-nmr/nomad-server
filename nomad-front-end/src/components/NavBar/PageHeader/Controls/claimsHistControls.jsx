import React from 'react'
import { Button, Switch, DatePicker } from 'antd'

import classes from '../PageHeader.module.css'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const claimsHistControls = props => {
  const { checked, onApprove, token } = props
  const datesHandler = dates => {
    const formattedDates = dates ? dates.map(date => date.format('YYYY-MM-DD')) : []
    props.setDateRange(formattedDates)
  }
  return (
    <div className={classes.ExtraContainer}>
      <Button
        className={classes.Button}
        type='primary'
        onClick={() => onApprove(token, checked)}
        disabled={checked.length === 0}
      >
        Approve Selected
      </Button>
      <div className={classes.SwitchElement}>
        <label>Show Approved</label>
        <Switch
          size='small'
          checked={props.showApproved}
          checkedChildren='On'
          unCheckedChildren='Off'
          onChange={props.toggleSwitch}
        />
      </div>
      <div style={{ marginLeft: '20px', width: '250px' }}>
        <RangePicker onChange={dates => datesHandler(dates)} allowClear />
      </div>
    </div>
  )
}

export default claimsHistControls
