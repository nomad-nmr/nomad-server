import React from 'react'
import { Form, Select, Space, Button, Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'


const { Option } = Select

const ClaimForm = props => {
  const [form] = Form.useForm()
  const { formReference } = props
  //Generating Option list for Select element
  let instrOptions = []
  if (props.instruments) {
    instrOptions = props.instruments.map(i => (
      <Option value={i.id} key={i.id}>
        {i.name}{' '}
      </Option>
    ))
  }

  const getFoldersHandler = values => {
    props.getFolders(props.token, values.instrumentId, values.groupId, props.showArchived)
  }

    const grpOptions = props.groupList.map(i => (
    <Option value={i.id} key={i.id}>
      {i.name}
    </Option>
  ))

  return (
    <div>
      <Form
        form={form}
        layout='inline'
        onFinish={values => getFoldersHandler(values)}
        ref={formReference}
      >
        <Space size='large' style={{ alignItems: 'flex-start' }}>
          <Form.Item
            label='Instrument'
            name='instrumentId'
            rules={[{ required: true, message: 'Please select an instrument!' }]}
          >
            <Select style={{ width: 200 }}>{instrOptions}</Select>
          </Form.Item>
          {props.userAccessLevel === 'admin' && (
          <Form.Item label='Group' name='groupId'>
               <Select
                 style={{ width: 150 }}
               >
                 {grpOptions}
               </Select>
             </Form.Item>
          )}
          <Form.Item>
            <Space size='large'>
              <Button htmlType='submit'>Get dataset folders</Button>
              <Tooltip title='Reset Form'>
                <Button
                  danger
                  shape='circle'
                  icon={<CloseOutlined />}
                  onClick={() => {
                    form.resetFields()
                    props.resetHandler()
                    props.resetProgress()
                  }}
                />
              </Tooltip>
            </Space>
          </Form.Item>
        </Space>
      </Form>
    </div>
  )
}

export default ClaimForm
