import React, { useRef, useState } from 'react'
import { Modal, Form, Space, Button, message, Tag, Divider } from 'antd'
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../../Forms/SelectGrpUsr/SelectGrpUsr'

const CollectionSharingModal = props => {
  const [form] = Form.useForm()
  const formRef = useRef({})

  const [shareList, setShareList] = useState([])
  const [listChanged, setListChanged] = useState(false)

  const tagStyle = { fontSize: '0.9rem', marginTop: 10 }

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
      const newShareList = [...shareList, { name: user.username, type: 'user', id: user._id }]
      setShareList(newShareList)
      setListChanged(true)
    }
  }

  const shareListElement = shareList.map((entry, index) => {
    const color = entry.type === 'group' ? 'cyan' : 'green'

    const removeEntry = id => {
      const updatedList = shareList.filter(entry => entry.id !== id)
      setShareList(updatedList)
      setListChanged(true)
    }

    return (
      <Tag
        key={index}
        closable
        style={tagStyle}
        color={color}
        onClose={e => {
          e.preventDefault()
          removeEntry(entry.id)
        }}
      >
        {entry.name}
      </Tag>
    )
  })

  const closeModal = () => {
    form.resetFields()
    setShareList([])
    props.openHandler(false)
    setListChanged(false)
  }

  return (
    <Modal
      width={800}
      title='Set collection sharing'
      open={props.open}
      maskClosable={false}
      onCancel={() => closeModal()}
      onOk={() => {
        console.log(shareList)
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

      <div style={{ marginBottom: 20 }}>
        <Tag color='cyan' style={tagStyle}>
          Group
        </Tag>
        <Tag color='green' style={tagStyle}>
          User
        </Tag>
        <Divider type='vertical' />
        {shareListElement}
      </div>
    </Modal>
  )
}

export default CollectionSharingModal
