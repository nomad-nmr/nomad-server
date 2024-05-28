import React, { useRef, useState } from 'react'
import { Form, Button, Input, Space, Modal, message } from 'antd'
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../Forms/SelectGrpUsr/SelectGrpUsr'
import UsrGrpTags from '../UsrGrpTags/UsrGrpTags'

import classes from './GrantForm.module.css'

const GrantForm = props => {
  const [form] = Form.useForm()
  const formRef = useRef({})

  const [usrGrpTags, setUsrGrpTags] = useState([])

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
      return usrGrpTags.find(i => i.id === entry.id)
    }
    if (!groupId) {
      return message.warning('Select group or user')
    } else if (!userId) {
      const group = props.groupList.find(grp => grp.id === groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }
      const newUsrGrpTags = [...usrGrpTags, { name: group.name, type: 'group', id: group.id }]
      setUsrGrpTags(newUsrGrpTags)
    } else {
      const user = props.userList.find(usr => usr._id === userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }
      if (isDuplicate({ id: groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }
      const newUsrGrpTags = [
        ...usrGrpTags,
        { name: user.username, fullName: user.fullName, type: 'user', id: user._id }
      ]
      setUsrGrpTags(newUsrGrpTags)
    }
  }

  const removeTag = id => {
    const updatedList = usrGrpTags.filter(entry => entry.id !== id)
    setUsrGrpTags(updatedList)
  }

  return (
    <div>
      <Form form={form} ref={formRef}>
        <Form.Item label='Grant Code' name='grantCode'>
          <Input style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label='Description' name='description'>
          <Input style={{ width: 470 }} />
        </Form.Item>
        <SelectGrpUsr
          groupList={props.groupList}
          userList={props.userList}
          fetchUsrListHandler={props.fetchUserList}
          token={props.authToken}
          formRef={formRef}
        />
        <Space size='large' style={{ marginBottom: 25, marginLeft: 25 }}>
          <Button type='primary' style={{ marginLeft: '20px' }} onClick={() => addUsrGrp()}>
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
          <UsrGrpTags state={usrGrpTags} removeEntry={removeTag} />
        </div>
        <Form.Item className={classes.Buttons}>
          <Space size='large'>
            <Button type='primary'>Submit</Button>
            <Button
              onClick={() => {
                props.onClose()
                form.resetFields()
              }}
            >
              Reset & Close
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default GrantForm
