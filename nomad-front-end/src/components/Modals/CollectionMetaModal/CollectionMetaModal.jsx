import React, { useEffect } from 'react'
import { Modal, Form, Input, Space, Button } from 'antd'

const CollectionMetaModal = props => {
  const { openHandler } = props
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldValue('title', props.metaData.title)
  })

  return (
    <Modal
      footer={null}
      width={650}
      title='Edit Collection metadata'
      open={props.open}
      onCancel={() => openHandler(false)}
    >
      <div style={{ marginTop: '20px' }}>
        <Form
          form={form}
          onFinish={values => {
            props.updateHandler(props.metaData.id, values, props.token)
            openHandler(false)
          }}
        >
          <Form.Item
            name='title'
            label='Title'
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Please input dataset title!'
              },
              { min: 5, message: 'Title must have minimum 5 characters' },
              { max: 80, message: 'Title can have maximum 80 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Form.Item>
              <Space size='large'>
                <Button type='primary' size='middle' htmlType='submit'>
                  OK
                </Button>
                <Button
                  onClick={() => {
                    openHandler(false)
                    form.resetFields()
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default CollectionMetaModal
