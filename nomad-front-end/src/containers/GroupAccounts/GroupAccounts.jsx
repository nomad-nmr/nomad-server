import React from 'react'
import { Form, DatePicker, Space, Button } from 'antd'

import classes from './GroupAccounts.module.css'

const { RangePicker } = DatePicker

const GroupAccounts = () => {
  const [form] = Form.useForm()

  return (
    <div>
      <Form form={form} layout='inline' className={classes.Form} onFinish={console.log('Finished')}>
        <Space size='large'>
          <Form.Item label='Date Range' name='dateRange'>
            <RangePicker allowClear={true} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Calculate Costs
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  )
}

export default GroupAccounts
