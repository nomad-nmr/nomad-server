import React from 'react'
import { Modal, Form, InputNumber, Space, Button, Input } from 'antd'

const AmendClaim = props => {
  const [form] = Form.useForm()

  const finishHandler = values => {
    props.updateClaimHandler(props.token, values)
    props.closeModalHandler()
    form.resetFields()
  }

  return (
    <Modal
      footer={null}
      width={350}
      title='Amend Claim'
      open={props.open}
      onCancel={() => {
        props.closeModalHandler()
        form.resetFields()
      }}
    >
      <Form
        form={form}
        ref={props.formReference}
        initialValues={props.state}
        onFinish={values => finishHandler(values)}
      >
        <Form.Item name='claimId' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='expTime' label='Total Experimental time'>
          <InputNumber addonAfter='hours' min={0} />
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          <Form.Item>
            <Space size='large'>
              <Button type='primary' size='middle' htmlType='submit'>
                OK
              </Button>
              <Button
                onClick={() => {
                  props.closeModalHandler()
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default AmendClaim
