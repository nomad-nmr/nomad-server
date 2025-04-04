import React, { useState, useEffect, useRef, Fragment } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Radio,
  Divider,
  Space,
  Button,
  message
} from 'antd'
import moment from 'moment'
import { TableOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'
import UsrGrpTags from '../../UsrGrpTags/UsrGrpTags'
import infoModals from './infoModals'

const AddRackModal = props => {
  const [mainForm] = Form.useForm()
  const [accessForm] = Form.useForm()

  const formRef = useRef({})

  const { Option } = Select
  const radioOptions = ['Group', 'Instrument']

  const [rackType, setRackType] = useState('Group')
  const [accessList, setAccessList] = useState([])
  const [showAccessForm, setShowAccessForm] = useState(false)

  useEffect(() => {
    if (rackType === 'Group') {
      mainForm.setFieldValue('slotsNumber', 72)
    } else {
      mainForm.setFieldValue('slotsNumber', null)
    }
  }, [rackType])

  const grpOptions = props.groupList
    .filter(grp => grp.isBatch)
    .map(grp => (
      <Option value={grp.id} key={grp.id}>
        {grp.name}
      </Option>
    ))

  const instrOptions = props.instruments.map(instr => (
    <Option key={instr.id} value={instr.id}>
      {instr.name}
    </Option>
  ))

  const resetModal = () => {
    mainForm.resetFields()
    accessForm.resetFields()
    setAccessList([])
    setRackType('Group')
    setShowAccessForm(false)
  }

  const closeModal = () => {
    resetModal()
    props.toggleHandler()
  }

  const submitForm = values => {
    props.onSubmit({ ...values, rackType, accessList }, props.token)
    resetModal()
  }

  const onGroupSelect = grpId => {
    const group = props.groupList.find(grp => grp.id === grpId)
    const title = group.name.toUpperCase() + ' - ' + moment().format('DD/MM/YYYY')
    mainForm.setFieldsValue({ title })
  }

  const onInstrumentSelect = instrId => {
    const instrument = props.instruments.find(instr => instr.id === instrId)
    const title = instrument.name.toUpperCase() + ' - ' + moment().format('DD/MM/YYYY')
    mainForm.setFieldsValue({ title })
  }

  const addEntry = formData => {
    const isDuplicate = entry => {
      //Without this the function does not work for user as there property _id not id
      if (entry._id) {
        entry.id = entry._id
      }
      return accessList.find(i => i.id === entry.id)
    }

    if (!formData.groupId) {
      return message.warning('Select group or user')
    } else if (!formData.userId) {
      const group = props.groupList.find(grp => grp.id === formData.groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }
      const newAccessList = [...accessList, { name: group.name, type: 'group', id: group.id }]
      setAccessList(newAccessList)
      setListChanged(true)
    } else {
      const user = props.userList.find(usr => usr._id === formData.userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }
      if (isDuplicate({ id: formData.groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }
      const newAccessList = [
        ...accessList,
        { name: user.username, fullName: user.fullName, type: 'user', id: user._id }
      ]
      setAccessList(newAccessList)
    }
  }

  const removeTag = id => {
    const updatedList = accessList.filter(entry => entry.id !== id)
    setAccessList(updatedList)
  }

  const accessEl = (
    <div>
      <Divider variant='solid'>Restrict Access</Divider>
      <Form form={accessForm} ref={formRef} onFinish={values => addEntry(values)}>
        <SelectGrpUsr
          groupList={props.groupList}
          userList={props.userList}
          fetchUsrListHandler={props.onGrpChange}
          token={props.token}
          formRef={formRef}
        />
        <Space size='large' style={{ marginBottom: 25, marginLeft: 25 }}>
          <Button type='primary' htmlType='submit'>
            Add
          </Button>
          <Button
            danger
            shape='circle'
            icon={<CloseOutlined />}
            onClick={() => {
              accessForm.resetFields()
            }}
          />
          <QuestionCircleOutlined
            onClick={infoModals.restrictAccess}
            style={{ color: '#1890ff', fontSize: '1rem' }}
          />
        </Space>
      </Form>
      <UsrGrpTags state={accessList} removeEntry={removeTag} />
    </div>
  )

  return (
    <Modal
      open={props.visible}
      maskClosable={false}
      onCancel={closeModal}
      width={rackType === 'Instrument' ? 800 : 600}
      title={
        <div style={{ color: '#096dd9' }}>
          <TableOutlined />
          <span style={{ marginLeft: '10px' }}>Add Rack</span>
        </div>
      }
      onOk={() => mainForm.submit()}
    >
      <Space size='large' style={{ marginBottom: 25, marginLeft: 100 }}>
        <QuestionCircleOutlined
          onClick={infoModals.rackType}
          style={{ color: '#1890ff', fontSize: '1rem' }}
        />
        <Radio.Group
          options={radioOptions}
          optionType='button'
          buttonStyle='solid'
          value={rackType}
          onChange={({ target: { value } }) => {
            setRackType(value)
            mainForm.resetFields()
            accessForm.resetFields()
            mainForm.setFieldValue('editParams', value === 'Instrument')
          }}
        />
      </Space>

      <Form
        form={mainForm}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={values => submitForm(values)}
      >
        {rackType === 'Group' && (
          <Form.Item name='group' label='Group' rules={[{ required: true }]}>
            <Select style={{ width: '50%' }} onSelect={value => onGroupSelect(value)}>
              {grpOptions}
            </Select>
          </Form.Item>
        )}
        {rackType === 'Instrument' && (
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
        <Form.Item
          name='slotsNumber'
          label='Number of Slots'
          rules={[{ required: true }, { type: 'integer' }]}
          initialValue={72}
        >
          <InputNumber min={1} />
        </Form.Item>
        {rackType === 'Instrument' && (
          <Form.Item
            name='startFrom'
            label='Start From Slot'
            rules={[{ required: true }, { type: 'integer' }]}
            initialValue={1}
          >
            <InputNumber min={1} />
          </Form.Item>
        )}
        <Form.Item name='editParams' label='Edit Parameters'>
          <Switch size='small' checkedChildren='ON' unCheckedChildren='OFF' />
        </Form.Item>
        {rackType === 'Group' && (
          <Form.Item name='sampleIdOn' label='Use Sample ID' initialValue={true}>
            <Switch size='small' checkedChildren='ON' unCheckedChildren='OFF' />
          </Form.Item>
        )}
        {rackType === 'Instrument' && (
          <Fragment>
            <Form.Item name='sampleJet' label='SampleJet Rack'>
              <Switch
                size='small'
                checkedChildren='ON'
                unCheckedChildren='OFF'
                onChange={value => {
                  mainForm.setFieldValue('slotsNumber', value && 96)
                }}
              />
            </Form.Item>
            <Form.Item label='Restrict Access'>
              <Switch
                size='small'
                checkedChildren='ON'
                unCheckedChildren='OFF'
                onChange={value => setShowAccessForm(value)}
              />
            </Form.Item>
          </Fragment>
        )}
      </Form>
      {rackType === 'Instrument' && showAccessForm ? accessEl : null}
    </Modal>
  )
}

export default AddRackModal
