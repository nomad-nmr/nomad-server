import React, { useRef, useState, useEffect } from 'react'
import { Modal, Form, Space, Button, message, Tag, Divider } from 'antd'
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'
import UsrGrpTags from '../../UsrGrpTags/UsrGrpTags'

const CollectionSharingModal = props => {
  const { sharedWithState } = props

  const [form] = Form.useForm()
  const formRef = useRef({})

  const [shareList, setShareList] = useState([])
  const [listChanged, setListChanged] = useState(false)

  useEffect(() => {
    if (sharedWithState) {
      setShareList(sharedWithState)
    }
  }, sharedWithState)

  const infoModal = () =>
    Modal.info({
      title: 'Tip',
      content: (
        <div>
          <p>You can select users to share the collection with.</p>
          <p>
            If no user is selected the collection will be shared with active users within selected
            group
          </p>
        </div>
      )
    })

  const addEntry = formData => {
    const isDuplicate = entry => {
      //Without this the function does not work for user as there property _id not id
      if (entry._id) {
        entry.id = entry._id
      }
      return shareList.find(i => i.id === entry.id)
    }

    if (!formData.groupId) {
      return message.warning('Select group or user')
    } else if (!formData.userId) {
      const group = props.groupList.find(grp => grp.id === formData.groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }
      const newShareList = [...shareList, { name: group.name, type: 'group', id: group.id }]
      setShareList(newShareList)
      setListChanged(true)
    } else {
      const user = props.userList.find(usr => usr._id === formData.userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }
      if (isDuplicate({ id: formData.groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }
      const newShareList = [
        ...shareList,
        { name: user.username, fullName: user.fullName, type: 'user', id: user._id }
      ]
      setShareList(newShareList)
      setListChanged(true)
    }
  }

  const removeTag = id => {
    const updatedList = shareList.filter(entry => entry.id !== id)
    setShareList(updatedList)
    setListChanged(true)
  }

  const closeModal = () => {
    form.resetFields()
    props.openHandler(false)
    setListChanged(false)
    setShareList(sharedWithState)
  }

  return (
    <Modal
      width={800}
      title='Set collection sharing'
      open={props.open}
      maskClosable={false}
      onCancel={() => closeModal()}
      onOk={() => {
        props.updateHandler(props.collectionId, shareList, props.token)
        closeModal()
      }}
      okButtonProps={{ disabled: !listChanged }}
    >
      <div style={{ marginTop: 22 }}>
        <Form form={form} ref={formRef} onFinish={values => addEntry(values)}>
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
                form.resetFields()
              }}
            />
            <QuestionCircleOutlined
              onClick={infoModal}
              style={{ color: '#1890ff', fontSize: '1rem' }}
            />
          </Space>
        </Form>
      </div>

      <UsrGrpTags state={shareList} removeEntry={removeTag} />
    </Modal>
  )
}

export default CollectionSharingModal
