import React, { useEffect } from 'react'

import { Form, Input, Select, Button, Space, Col, Row, Checkbox, Modal } from 'antd'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import dataAccessOptions from '../dataAccessOptions'

const { confirm } = Modal
const { Option } = Select

const GroupForm = props => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  })

  const onFinish = formData => {
    console.log(formData)
    if (formData._id) {
      if (!formData.isActive) {
        confirm({
          title: 'Setting a group inactive will also set all users in the group inactive?',
          icon: <ExclamationCircleOutlined />,
          content: 'Do you want to continue',
          onOk() {
            props.updateGroupHandler(formData, props.authToken)
          },
          onCancel() {
            return
          }
        })
      } else {
        props.updateGroupHandler(formData, props.authToken)
      }
    } else {
      props.addGroupHandler(formData, props.authToken)
    }
  }

  const onReset = () => {
    form.resetFields()
    props.toggleForm()
  }

  const options = props.paramSets.map(paramSet => (
    <Option key={paramSet.id} value={paramSet.id}>
      {paramSet.name}
    </Option>
  ))

  return (
    <div style={{ margin: '25px 0' }}>
      <Form
        form={form}
        ref={props.formReference}
        layout='horizontal'
        onFinish={onFinish}
        initialValues={{ isActive: true, dataAccess: 'user' }}
      >
        <Form.Item hidden name='_id'>
          <Input />
        </Form.Item>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              name='groupName'
              label='Group Name'
              rules={[{ required: true, whitespace: true, message: 'Group name is required' }]}
            >
              <Input disabled={props.editing} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name='description' label='Description'>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name='isBatch'
              label='Batch Submit'
              valuePropName='checked'
              tooltip='The group can use batch submission'
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item name='isActive' label='Active' valuePropName='checked' style={{ margin: 0 }}>
              <Checkbox />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={14}>
            <Form.Item name='expList' label='Custom experiment list'>
              <Select mode='multiple' allowClear style={{ marginRight: '40px' }}>
                {options}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name='dataAccess'
              label='Data Access'
              tooltip={`
              user - users can see only own data,
              group - users can see data of other users in the group, 
              admin - users can see data of all other users
              `}
            >
              <Select>{dataAccessOptions}</Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              <Space size='middle'>
                <Button type='primary' htmlType='submit'>
                  Submit
                </Button>
                <Button htmlType='button' onClick={onReset}>
                  Reset & Close
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default GroupForm
