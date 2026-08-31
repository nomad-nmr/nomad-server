import React from 'react'
import { Popover } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import nightIcon from '../../assets/night-mode.svg'
import dayIcon from '../../assets/sunny-day.svg'

const NightDay = props => {
  if (import.meta.env.VITE_SUBMIT_ON === 'false') {
    return null
  } else if (props.endTime) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Popover content={`Timed experiments end at ${props.endTime}`}>
          <ClockCircleOutlined style={{ fontSize: '18px' }} />
        </Popover>
      </div>
    )
  } else if (props.night === true) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={nightIcon} style={{ height: '18px' }} alt='night icon' />
      </div>
    )
  } else if (props.night === false) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={dayIcon} style={{ height: '18px' }} alt='day icon' />
      </div>
    )
  } else {
    return null
  }
}

export default NightDay
