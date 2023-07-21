import React, { useEffect, useRef } from 'react'
import { Modal, Form, Input, Space, Button, message } from 'antd'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'
import { skimNMRiumdata } from '../../../utils/nmriumUtils'

const DataSetModal = props => {
  const [form] = Form.useForm()
  const formReference = useRef({})
  const { editing, dataset, token } = props

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        title: dataset.title
        // groupId: dataset.group._id,
        // userId: dataset.user._id
      })
    }
  }, [editing, dataset])

  return (
    <Modal footer={null} width={650} open={props.open} title='Save DataSet As' closeIcon={null}>
      <div style={{ marginTop: '20px' }}>
        <Form
          form={form}
          ref={formReference}
          onFinish={values => {
            if (editing) {
              if (values.groupId && !values.userId) {
                return message.error('User was not selected!')
              }
              props.patchDataset(dataset.id, values, token)
            } else {
              const nmriumData = skimNMRiumdata(props.nmriumDataOutput)
              props.saveAsHandler({ ...values, nmriumData }, token)
            }
            form.resetFields()
          }}
        >
          {props.accessLevel === 'admin' && (
            <SelectGrpUsr
              groupList={props.groupList}
              userList={props.userList}
              fetchUsrListHandler={props.onGrpChange}
              token={props.token}
              formRef={formReference}
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
                    props.cancelHandler()
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

export default DataSetModal
