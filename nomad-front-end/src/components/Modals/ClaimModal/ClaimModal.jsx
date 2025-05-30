import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import moment from 'moment'

const ClaimModal = props => {
  const { checked, open, accessLevel, updateUserId, instrumentId, token, userid,  user, userList, canClaimForOthers } = props

  const [form] = Form.useForm()

  const userOptions = (!canClaimForOthers ? [user] :  [user, ...userList])
  .map(i => (
    <Option value={i._id} key={i._id}>
      {`[${i.username}] ${i.fullName}`}
    </Option>
  ))

  useEffect(() => {
    if (checked.length > 0 && open) {
      const expTimeSum = checked.reduce(
        (accu, i) => accu + Math.round(moment.duration(i.totalExpTime).asHours()),
        0
      )
      form.setFieldsValue({
        totalExpT: expTimeSum,
        user: `${props.user.fullName} [${props.user.username}]`
      })
    }
  }, [checked, open])

  let expsArr = []
  checked.forEach(entry => {
    expsArr = [...expsArr, ...entry.exps]
  })

  const userSelectHandler = (newid) => {
    updateUserId(newid);
  }

  const processForm = () => {
    const values = form.getFieldsValue();
    props.claimHandler(token, {
      userId: userid,
      instrumentId,
      expsArr,
      expTime: values.totalExpT,
      note: values.note
    })
    props.toggleModal()
  }

  //TODO, MAKE THE CHANGE HANDLER BETTER QUALITY
  return (
    <Modal
      title='Manual Data Claim'
      open={open}
      onCancel={() => props.toggleModal()}
      onOk={() => processForm()}
    >
      <Form form={form} style={{ marginTop: '20px' }}>
        <Form.Item name='user' label='User'>
             <Select  disabled={!canClaimForOthers} onChange={userSelectHandler} style={{ width: 250 }} >
                     {userOptions}
            </Select>
        </Form.Item>
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
