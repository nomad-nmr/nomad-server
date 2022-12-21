import React from 'react'
import { Form, DatePicker, Button, Select, Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { Option } = Select
const { RangePicker } = DatePicker

const AccountsForm = props => {
  const [form] = Form.useForm()

  const grpOptions = props.groupList.map(grp => (
    <Option value={grp.id} key={grp.id}>
      {grp.name}
    </Option>
  ))

  return (
    <Form form={form} layout='inline' onFinish={values => props.submitHandler(values)}>
      <Form.Item label='Group' name='groupId'>
        <Select style={{ width: 150 }}>{grpOptions}</Select>
      </Form.Item>
      <Form.Item label='Date Range' name='dateRange'>
        <RangePicker allowClear={true} />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={props.loading}>
          Calculate Costs
        </Button>
      </Form.Item>
      <Form.Item>
        <Tooltip title='Reset Form'>
          <Button
            danger
            shape='circle'
            icon={<CloseOutlined />}
            onClick={() => {
              form.resetFields()
              props.resetHandler()
            }}
          />
        </Tooltip>
      </Form.Item>
    </Form>
  )
}

export default AccountsForm
