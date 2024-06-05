import React, { useRef, useState, useEffect } from 'react'
import { Form, Button, Input, Space, Modal, message } from 'antd'
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../Forms/SelectGrpUsr/SelectGrpUsr'
import UsrGrpTags from '../UsrGrpTags/UsrGrpTags'

import classes from './GrantForm.module.css'

const GrantForm = props => {
  const { onClose, authToken, formRef, tagsState, setTagsState } = props
  const [form] = Form.useForm()

  const infoModal = () =>
    Modal.info({
      title: 'Add group or user',
      content: (
        <div>
          <p>You can select individual users and assign them to a grant.</p>
          <p>If you want to assign whole group don't select any user and click "Add" button</p>
        </div>
      )
    })

  const addUsrGrp = () => {
    const { userId, groupId } = form.getFieldsValue()
    const isDuplicate = entry => {
      //Without this the function does not work for user as there property _id not id
      if (entry._id) {
        entry.id = entry._id
      }
      return tagsState.find(i => i.id === entry.id)
    }
    if (!groupId) {
      return message.warning('Select group or user')
    } else if (!userId) {
      const group = props.groupList.find(grp => grp.id === groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }
      const newUsrGrpTags = [...tagsState, { name: group.name, type: 'group', id: group.id }]
      setTagsState(newUsrGrpTags)
    } else {
      const user = props.userList.find(usr => usr._id === userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }
      if (isDuplicate({ id: groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }
      const newUsrGrpTags = [
        ...tagsState,
        { name: user.username, fullName: user.fullName, type: 'user', id: user._id }
      ]
      setTagsState(newUsrGrpTags)
    }
  }

  const removeTag = id => {
    const updatedList = tagsState.filter(entry => entry.id !== id)
    setTagsState(updatedList)
  }

  const clearForm = () => {
    onClose()
    form.resetFields()
    setTagsState([])
  }

  const submitHandler = values => {
    delete values.groupId
    delete values.userId

    const usrGrpIdArray = []
    props.tableData.forEach(entry => {
      if (entry._id !== values._id) {
        entry.include.forEach(element => {
          usrGrpIdArray.push(element.id)
        })
      }
    })

    console.log(usrGrpIdArray)
    const reqObject = {
      ...values,
      include: props.tagsState.map(i => ({ isGroup: i.type === 'group', id: i.id, name: i.name }))
    }
    if (values._id) {
      props.onUpdate(authToken, reqObject)
    } else {
      props.onAdd(authToken, reqObject)
    }
    clearForm()
  }

  return (
    <div>
      <Form form={form} ref={formRef} onFinish={submitHandler}>
        <Form.Item name='_id' hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label='Grant Code'
          name='grantCode'
          rules={[
            {
              required: true,
              message: 'Please input grant code!'
            }
          ]}
        >
          <Input style={{ width: 200 }} disabled={form.getFieldValue('_id')} />
        </Form.Item>
        <Form.Item label='Description' name='description'>
          <Input style={{ width: 470 }} />
        </Form.Item>
        <SelectGrpUsr
          groupList={props.groupList}
          userList={props.userList}
          fetchUsrListHandler={props.fetchUserList}
          token={authToken}
          formRef={formRef}
        />
        <Space size='large' style={{ marginBottom: 25, marginLeft: 25 }}>
          <Button
            type='primary'
            style={{ marginLeft: '20px' }}
            onClick={() => {
              addUsrGrp()
            }}
          >
            Add
          </Button>
          <Button
            danger
            shape='circle'
            icon={<CloseOutlined />}
            onClick={() => {
              form.resetFields()
            }}
          />
          <QuestionCircleOutlined onClick={infoModal} className={classes.Icon} />
        </Space>
        <div>
          <UsrGrpTags state={tagsState} removeEntry={removeTag} />
        </div>
        <Form.Item className={classes.Buttons}>
          <Space size='large'>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
            <Button onClick={() => clearForm()}>Reset & Close</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default GrantForm
