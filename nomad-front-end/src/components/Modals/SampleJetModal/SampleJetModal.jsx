import React from 'react'
import { Modal, Form, Radio, Space, Button } from 'antd'

const SampleJetModal = props => {
  const [form] = Form.useForm()

  const onCancel = () => {
    form.resetFields()
    props.toggleVisible()
  }

  const submitHandler = formData => {
    const data = { ...formData, ...props.rackData }
    props.submitBookingData(data, props.token)
    onCancel()
  }

  return (
    <Modal title='Select SampleJet Rack Position' open={props.visible} footer={null}>
      <Form form={form} onFinish={values => submitHandler(values)}>
        <Form.Item
          label='Rack Position'
          name='rackPosition'
          rules={[
            {
              required: true
            }
          ]}
        >
          <Radio.Group>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Space>
              <Button type='primary' size='middle' htmlType='submit'>
                Submit
              </Button>
              <Button
                size='middle'
                onClick={() => {
                  onCancel()
                }}
              >
                Reset & Close
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SampleJetModal
