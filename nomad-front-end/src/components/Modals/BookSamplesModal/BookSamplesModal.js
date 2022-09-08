import React from 'react'
import { Modal, Select, Form, Checkbox, Button, Space, message } from 'antd'

const { Option } = Select

const BookSamplesModal = props => {
  const tailLayout = {
    wrapperCol: {
      offset: 2,
      span: 22
    }
  }

  const instrOptions = props.instruments.map(instr => (
    <Option key={instr.id} value={instr.id}>
      {instr.name}
    </Option>
  ))

  const submitHandler = formData => {
    if (props.rackData.slots.length === 0) {
      props.toggleHandler()
      message.warning('No slots have been selected!')
    } else {
      const data = { ...formData, ...props.rackData }
      props.submitBookingData(data, props.token)
    }
  }

  return (
    <Modal title='Book Selected Samples' visible={props.visible} onCancel={props.toggleHandler} footer={null}>
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ closeQueue: true }}
        onFinish={values => submitHandler(values)}
      >
        <Form.Item label='Instrument' name='instrId' rules={[{ required: true }]}>
          <Select style={{ width: '90%' }}>{instrOptions}</Select>
        </Form.Item>
        <Form.Item name='closeQueue' valuePropName='checked' wrapperCol={{ offset: 6, span: 18 }}>
          <Checkbox>Close Queue</Checkbox>
        </Form.Item>

        <Form.Item style={{ textAlign: 'center', margin: 0 }} {...tailLayout}>
          <Space size='large'>
            <Button type='primary' htmlType='submit'>
              Continue
            </Button>
            <Button onClick={() => props.toggleHandler()}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default BookSamplesModal
