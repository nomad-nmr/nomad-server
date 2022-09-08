import React from 'react'
import { Form, Select, InputNumber, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'
import classes from '../Form.module.css'

const { Option } = Select

const BookHoldersForm = props => {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  //Generating Option list for Select element
  let instrOptions = []
  if (props.instruments) {
    instrOptions = props.instruments.map(i => (
      <Option value={i.id} key={i.id}>
        {i.name}{' '}
      </Option>
    ))
  }

  return (
    <div className={classes.InLineForm}>
      <Form
        layout='inline'
        form={form}
        ref={props.formRef}
        initialValues={{ count: 1 }}
        onFinish={values => props.onSubmit(values)}
      >
        <Space size='large' style={{ alignItems: 'flex-start' }}>
          {props.accessLevel === 'admin' && (
            <SelectGrpUsr
              userList={props.userList}
              groupList={props.groupList}
              token={props.token}
              fetchUsrListHandler={props.onGrpChange}
              formRef={props.formRef}
            />
          )}
          <Form.Item label='Instrument' name='instrumentId' rules={[{ required: true }]}>
            <Select style={{ width: 200 }}>{instrOptions}</Select>
          </Form.Item>
          <Form.Item
            label='Number of samples'
            name='count'
            rules={[{ type: 'integer', required: true, message: 'Number of samples must be integer' }]}
          >
            <InputNumber min={1} max={5 - props.bookedCount} style={{ width: 60 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' disabled={props.bookedCount >= 5}>
                Book Slots
              </Button>
              <Button
                onClick={() => {
                  navigate('/dashboard', { replace: true })
                }}
              >
                Cancel & return
              </Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>
    </div>
  )
}

export default BookHoldersForm
