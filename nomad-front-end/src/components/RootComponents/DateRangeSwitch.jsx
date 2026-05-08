import React, { useState } from 'react'
import { Space, Select, Radio, DatePicker } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const DateRangeSwitch = () => {
  const [selectedInput, setSelectedInput] = useState(1)

  return (
    <Space size='large'>
      <Select
        defaultValue='total'
        style={{ width: 150, marginLeft: '160px' }}
        disabled={selectedInput !== 1}
      >
        <Select.Option value='total'>Total</Select.Option>
        <Select.Option value='last_30_days'>Last 30 Days</Select.Option>
        <Select.Option value='today'>Today</Select.Option>
      </Select>
      <ArrowLeftOutlined />
      <Radio.Group
        value={selectedInput}
        onChange={e => setSelectedInput(e.target.value)}
        options={[{ value: 1, label: '       ' }, { value: 2 }]}
      />
      <ArrowRightOutlined />
      <RangePicker disabled={selectedInput !== 2} />
    </Space>
  )
}

export default DateRangeSwitch
