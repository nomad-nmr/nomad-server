import React, { useEffect } from 'react'
import { Modal, Form, Input, Checkbox, Flex, Divider, Button, Space } from 'antd'

const AccountSettingsModal = props => {
  const { authToken, fetchUserData, userSettings, onSave, setModalVisible } = props

  const [form] = Form.useForm()

  useEffect(() => {
    if (authToken) {
      fetchUserData(authToken)
    }
  }, [authToken])

  useEffect(() => {
    form.setFieldsValue(userSettings)
  }, [userSettings])

  return (
    <Modal title='User Account Settings' open={props.modalVisible} footer={null}>
      <Form
        form={form}
        onFinish={values => {
          onSave(authToken, values)
          setModalVisible(false)
        }}
      >
        <Form.Item label='Username' name='username' style={{ width: '200px', marginTop: '30px' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item label='Full Name' name='fullName'>
          <Input />
        </Form.Item>
        <Divider> Send Status Email</Divider>
        <Flex justify='space-around'>
          <Form.Item label='Error' name='sendStatusError' valuePropName='checked'>
            <Checkbox />
          </Form.Item>
          <Form.Item label='Archived' name='sendStatusArchived' valuePropName='checked'>
            <Checkbox />
          </Form.Item>
        </Flex>
        <Form.Item style={{ textAlign: 'center' }}>
          <Space size='middle'>
            <Button type='primary' htmlType='submit'>
              Save
            </Button>
            <Button htmlType='button' onClick={() => setModalVisible(false)}>
              Close
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AccountSettingsModal
