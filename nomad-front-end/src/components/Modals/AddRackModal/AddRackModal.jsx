import React, { useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, InputNumber } from 'antd'
import { TableOutlined } from '@ant-design/icons'
import moment from 'moment'

const tailLayout = {
  wrapperCol: {
    offset: 2,
    span: 22
  }
}

const AddRackModal = props => {
  const [form] = Form.useForm()
  const { Option } = Select

  const [isForAll, setIsForAll] = useState(false)

  const grpOptions = props.groupList
    .filter(grp => grp.isBatch)
    .map(grp => (
      <Option value={grp.id} key={grp.id}>
        {grp.name}
      </Option>
    ))

  grpOptions.push(
    <Option value={'#all#'} key={'#all#'}>
      -- open for all --
    </Option>
  )

  const instrOptions = props.instruments.map(instr => (
    <Option key={instr.id} value={instr.id}>
      {instr.name}
    </Option>
  ))

  const closeModal = () => {
    form.resetFields()
    props.toggleHandler()
    setIsForAll(false)
  }

  const submitForm = values => {
    props.onSubmit(values, props.token)
    form.resetFields()
    setIsForAll(false)
  }

  const onGroupSelect = grpId => {
    if (grpId === '#all#') {
      // title = moment().format('DD/MM/YYYY - HH:MM')
      setIsForAll(true)
    } else {
      const group = props.groupList.find(grp => grp.id === grpId)
      const title = group.name.toUpperCase() + ' - ' + moment().format('DD/MM/YYYY')
      setIsForAll(false)
      form.setFieldsValue({ title })
    }
  }

  const onInstrumentSelect = instrId => {
    const instrument = props.instruments.find(instr => instr.id === instrId)
    const title = instrument.name.toUpperCase() + ' - ' + moment().format('DD/MM/YYYY')
    form.setFieldsValue({ title })
  }

  return (
    <Modal
      footer={null}
      open={props.visible}
      onCancel={closeModal}
      title={
        <div style={{ color: '#096dd9' }}>
          <TableOutlined />
          <span style={{ marginLeft: '10px' }}>Add Rack</span>
        </div>
      }
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ slotsNumber: 72 }}
        onFinish={values => submitForm(values)}
      >
        <Form.Item name='group' label='Group' rules={[{ required: true }]}>
          <Select style={{ width: '50%' }} onSelect={value => onGroupSelect(value)}>
            {grpOptions}
          </Select>
        </Form.Item>
        {isForAll && (
          <Form.Item name='instrument' label='Instrument' rules={[{ required: true }]}>
            <Select style={{ width: '50%' }} onSelect={value => onInstrumentSelect(value)}>
              {instrOptions}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name='title'
          label='Rack Title'
          rules={[{ required: true, whitespace: true, message: 'Rack title is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='slotsNumber' label='Number of Slots' rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item style={{ textAlign: 'center' }} {...tailLayout}>
          <Space size='large'>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
            <Button onClick={() => closeModal()}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddRackModal
