import React, { useEffect } from 'react'
import { Form, DatePicker, Button, Select, Tooltip, Radio, Modal, Space, Checkbox } from 'antd'
import { CloseOutlined, QuestionOutlined } from '@ant-design/icons'
import infoModalConfig from './infoModalCosting'

const { Option } = Select
const { RangePicker } = DatePicker

const AccountsForm = props => {
  const [form] = Form.useForm()
  const { type, token } = props

  useEffect(() => form.resetFields(), [type])

  let grpOptions = props.groupList.map(grp => (
    <Option value={grp.id} key={grp.id}>
      {grp.name}
    </Option>
  ))

  grpOptions = [
    <Option value='all' key='all'>
      --all--
    </Option>,
    ...grpOptions
  ]

  const radioOptions = ['Grants', 'Groups', 'Users']

  const submitHandler = values => {
    const { dateRange } = values

    if (type === 'Users' && values && !values.groupId) {
      return Modal.error({
        title: 'No group defined',
        content: 'Please select the group for which you want to perform the calculation.'
      })
    }

    const fetchCosts = () => {
      if (dateRange) {
        values.dateRange = dateRange.map(date => date.format('YYYY-MM-DD'))
      }

      if (type !== 'Grants') {
        props.getCosts(token, values)
      } else {
        props.getGrantsCosts(token, { dateRange: values.dateRange })
      }
    }

    if (!dateRange) {
      return Modal.confirm({
        title: 'Date range not defined',
        content: (
          <div>
            <p>If date range is not defined, the calculation can take very long time</p>
            <p>Do you want to proceed?</p>
          </div>
        ),
        onOk() {
          fetchCosts()
        }
      })
    }
    fetchCosts()
  }

  return (
    <Form form={form} layout='inline' onFinish={values => submitHandler(values)}>
      <Space size='large' style={{ marginRight: '30px' }}>
        <Button
          shape='circle'
          icon={<QuestionOutlined />}
          size='small'
          onClick={() => Modal.info(infoModalConfig)}
        />
        <Radio.Group
          options={radioOptions}
          optionType='button'
          buttonStyle='solid'
          value={type}
          onChange={({ target: { value } }) => props.typeHandler(value)}
        />
      </Space>
      <Form.Item label='Group' name='groupId'>
        <Select
          loading={props.groupList.length === 0}
          style={{ width: 150 }}
          disabled={type !== 'Users'}
        >
          {grpOptions}
        </Select>
      </Form.Item>
      <Form.Item label='Date Range' name='dateRange'>
        <RangePicker allowClear={true} />
      </Form.Item>
      {type === 'Users' && (
        <Form.Item
          label='Multiplier'
          name='useMultiplier'
          tooltip='Use grant cost multiplier for calculation'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
      )}
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
