import React from 'react'
import { DatePicker, Button, Space } from 'antd'
import moment from 'moment'

const ExpHistControls = props => {
  const { instrId, token } = props
  return (
    <Space size='large'>
      <DatePicker
        style={{ marginLeft: '10px' }}
        defaultValue={moment()}
        allowClear={false}
        format='DD MMM YYYY'
        onChange={date => props.dateHandler(moment(date).format('YYYY-MM-DD'))}
      />
      <Button type='primary' onClick={() => props.fetchRepair(instrId, token)}>
        Repair
      </Button>
    </Space>
  )
}

export default ExpHistControls
