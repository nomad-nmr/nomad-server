import React, { useEffect, useRef } from 'react'
import { Modal, Form, Input } from 'antd'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'

const DataSetModal = props => {
  const [form] = Form.useForm()
  const formReference = useRef({})

  useEffect(() => {})

  return (
    <Modal
      width={650}
      open={props.open}
      title='Save DataSet As'
      onCancel={() => props.cancelHandler()}
    >
      <div style={{ marginTop: '20px' }}>
        <Form form={form} ref={formReference}>
          {props.accessLevel && (
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
                message: 'Please input dataset title!'
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default DataSetModal
