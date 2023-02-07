import React from 'react'
import { DatePicker, Button, Space } from 'antd'
import dayjs from 'dayjs'

const ExpHistControls = props => {
  const { instrId, token } = props
  return (
    <Space size='large'>
      <DatePicker
        style={{ marginLeft: '10px' }}
        defaultValue={dayjs()}
        allowClear={false}
        format='DD MMM YYYY'
        onChange={date => props.dateHandler(dayjs(date).format('YYYY-MM-DD'))}
      />
      <Button type='primary' onClick={() => props.fetchRepair(instrId, token)}>
        Repair
      </Button>
    </Space>
  )
}

export default ExpHistControls
