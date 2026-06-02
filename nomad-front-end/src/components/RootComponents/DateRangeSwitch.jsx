import React from 'react'
import { Space, Select, Radio, DatePicker } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const DateRangeSwitch = props => {
  const { selectedInputValue, selectedRadioButton } = props

  return (
    <Space size='large'>
      <Select
        style={{ width: 150, marginLeft: '140px' }}
        disabled={selectedRadioButton !== 1}
        value={selectedInputValue}
        onChange={value => props.selectInputHandler(value)}
      >
        <Select.Option value='total'>Total</Select.Option>
        <Select.Option value='last_30_days'>Last 30 Days</Select.Option>
        <Select.Option value='today'>Today</Select.Option>
      </Select>
      <ArrowLeftOutlined />
      <Radio.Group
        value={selectedRadioButton}
        onChange={e => props.radioButtonHandler(e.target.value)}
        options={[{ value: 1, label: '       ' }, { value: 2 }]}
      />
      <ArrowRightOutlined />
      <RangePicker
        disabled={selectedRadioButton !== 2}
        value={props.dateRangeValue.map(date => (date ? dayjs(date) : null))}
        allowEmpty={true}
        onChange={value => {
          props.dateRangeHandler(value)
        }}
      />
    </Space>
  )
}

export default DateRangeSwitch
