import React, { useEffect, useRef } from 'react'
import { Modal, Form, Input, Space, Button, message } from 'antd'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'

const CollectionMetaModal = props => {
  const { openHandler } = props
  const [form] = Form.useForm()
  const formRef = useRef({})

  useEffect(() => {
    form.setFieldValue('title', props.metaData.title)
  })

  return (
    <Modal
      footer={null}
      width={650}
      title='Edit collection metadata'
      open={props.open}
      onCancel={() => {
        openHandler(false)
        form.resetFields()
      }}
    >
      <div style={{ marginTop: '20px' }}>
        <Form
          form={form}
          ref={formRef}
          onFinish={values => {
            if (!values.userId && values.groupId) {
              message.error('user undefined')
            } else {
              props.updateHandler(props.metaData.id, values, props.token)
              openHandler(false)
            }
          }}
        >
          {props.accessLevel === 'admin' && (
            <SelectGrpUsr
              groupList={props.groupList}
              userList={props.userList}
              fetchUsrListHandler={props.onGrpChange}
              token={props.token}
              formRef={formRef}
            />
          )}
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
