import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import moment from 'moment'

const ClaimModal = props => {
  const {
    checked,
    open,
    accessLevel,
    instrumentId,
    token,
    userList,
    canClaimForOthers,
    sampleManager
  } = props

  const [form] = Form.useForm()

  const userOptions = userList.map(i => (
    <Select.Option value={i._id} key={i._id ? i._id : 'undefined'}>
      {`[${i.username}] ${i.fullName}`}
    </Select.Option>
  ))

  useEffect(() => {
    if (checked.length > 0 && open) {
      const expTimeSum = checked.reduce(
        (accu, i) => accu + Math.round(moment.duration(i.totalExpTime).asHours()),
        0
      )
      form.setFieldsValue({
        totalExpT: expTimeSum
      })
    }
  }, [checked, open])

  let expsArr = []
  checked.forEach(entry => {
    expsArr = [...expsArr, ...entry.exps]
  })

  const processForm = () => {
    const values = form.getFieldsValue()
    props.claimHandler(token, {
      userId: values.userId,
      instrumentId,
      expsArr,
      expTime: values.totalExpT,
      note: values.note,
      sampleManager
    })
    props.toggleModal()
  }

  return (
    <Modal
      title={sampleManager ? 'Sample Manager Dataset Claim' : 'Manual Data Claim'}
      open={open}
      onCancel={() => {
        props.resetClaim()
        props.toggleModal()
      }}
      onOk={() => form.submit()}
    >
      <Form onFinish={processForm} form={form} style={{ marginTop: '20px' }}>
        {canClaimForOthers && (
          <Form.Item
            name='userId'
            label='User'
            rules={[{ required: true, message: 'Please select user that you claim data for!' }]}
          >
            <Select disabled={!canClaimForOthers} style={{ width: 250 }}>
              {userOptions}
            </Select>
          </Form.Item>
        )}
        <Form.Item name='note' label='Note'>
          <Input />
        </Form.Item>
        <div style={{ width: '65%' }}>
          <Form.Item name='totalExpT' label='Total Experimental time'>
            <InputNumber addonAfter='hours' disabled={accessLevel !== 'admin'} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default ClaimModal
