import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Form, Button, Space, Tag, Divider, Input, Modal, message, Spin } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

import SelectGrpUsr from '../../components/Forms/SelectGrpUsr/SelectGrpUsr'
import { fetchGroupList, fetchUserList, sendMessage } from '../../store/actions'

import classes from './Message.module.css'

const Message = props => {
  const [formRecipients] = Form.useForm()
  const [formMessage] = Form.useForm()

  const formRef = useRef({})
  const location = useLocation()

  const { fetchGrpList, authToken } = props

  const [recipients, setRecipients] = useState([])
  const [excludeRec, setExcludeRec] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchGrpList(authToken)
  }, [fetchGrpList, authToken])

  // Hook handles redirect from users table
  useEffect(() => {
    const query = new URLSearchParams(location.search).entries()
    const { userId, username } = Object.fromEntries(query)
    if (userId) {
      setRecipients([{ name: username, type: 'user', id: userId }])
    }
  }, [location])

  const infoModal = () =>
    Modal.info({
      title: 'Tip',
      content: (
        <div>
          <p>Add recipient with no group selected to address all active users</p>
          <p>Add recipient with no user selected to address all active users within selected group</p>
          <p>
            Analogously you can creat a list of recipients that will be excluded and won't receive the message
          </p>
        </div>
      )
    })

  const addRecipientHandler = formData => {
    //console.log(formData)

    const isDuplicate = entry => {
      //Without this the function does not work for user as there property _id not id
      if (entry._id) {
        entry.id = entry._id
      }
      return recipients.find(recipient => recipient.id === entry.id)
    }
    const sendsToAll = () => recipients.find(recipient => recipient.id === 'all')

    //Validation to disable duplicate entries
    if (sendsToAll()) {
      return message.error(`The message is addressed to all active users already`)
    }
    if (!formData.groupId) {
      setRecipients([{ name: 'All Active Users', type: 'all', id: 'all' }])
    } else if (!formData.userId) {
      const group = props.grpList.find(grp => grp.id === formData.groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }

      const newRecipients = [...recipients, { name: group.name, type: 'group', id: group.id }]
      setRecipients(newRecipients)
    } else {
      const user = props.usrList.find(usr => usr._id === formData.userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }

      if (isDuplicate({ id: formData.groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }

      const newRecipients = [...recipients, { name: user.username, type: 'user', id: user._id }]
      setRecipients(newRecipients)
    }
  }

  const excludeRecipient = () => {
    const isDuplicate = entry => excludeRec.find(recipient => recipient.id === entry.id)

    const formRecipientsValues = formRecipients.getFieldsValue()
    if (!formRecipientsValues.groupId && !formRecipientsValues.userId) {
      return message.warning('No recipient selected!')
    } else if (!formRecipientsValues.userId) {
      const group = props.grpList.find(grp => grp.id === formRecipientsValues.groupId)
      if (isDuplicate(group)) {
        return message.error(`Group ${group.name} already in the list`)
      }

      const newRecipients = [...excludeRec, { name: group.name, type: 'group', id: group.id }]
      setExcludeRec(newRecipients)
    } else {
      const user = props.usrList.find(usr => usr._id === formRecipientsValues.userId)
      if (isDuplicate(user)) {
        return message.error(`User ${user.username} already in the list`)
      }

      if (isDuplicate({ id: formRecipientsValues.groupId })) {
        return message.error(`User ${user.username} in a group that is already in the list`)
      }
      const newRecipients = [...excludeRec, { name: user.username, type: 'user', id: user._id }]
      setExcludeRec(newRecipients)
    }
  }

  const getRecElement = (recList, exclude) => {
    const removeRecipientHandler = id => {
      const updatedRecipients = recList.filter(recipient => recipient.id !== id)
      if (exclude) {
        setExcludeRec(updatedRecipients)
      } else {
        setRecipients(updatedRecipients)
      }
    }
    const recipientsElement = recList.map((recipient, index) => {
      const color = recipient.type === 'group' ? 'cyan' : recipient.type === 'user' ? 'green' : 'orange'

      return (
        <Tag
          key={index}
          closable
          className={classes.Tag}
          color={color}
          onClose={e => {
            e.preventDefault()
            removeRecipientHandler(recipient.id)
          }}
        >
          {recipient.name}
        </Tag>
      )
    })

    return recipientsElement
  }

  const formFinishHandler = formData => {
    if (recipients.length === 0) {
      return message.error('Message has no recipients!')
    }
    props.sendMsg(authToken, { ...formData, recipients, excludeRec })
    formMessage.resetFields()
    formRecipients.resetFields()
    setRecipients([])
    setExcludeRec([])
  }

  return (
    <Spin spinning={props.sending} tip='Sending ...' size='large'>
      <Form
        form={formRecipients}
        ref={formRef}
        style={{ marginTop: 35 }}
        onFinish={values => addRecipientHandler(values)}
      >
        <Space size='large'>
          <SelectGrpUsr
            groupList={props.grpList}
            userList={props.usrList}
            fetchUsrListHandler={props.fetchUsrList}
            formRef={formRef}
            token={props.authToken}
          />
          <Button type='primary' style={{ marginBottom: 25 }} htmlType='submit'>
            Add Recipient
          </Button>
          <Button danger type='dashed' style={{ marginBottom: 25 }} onClick={() => excludeRecipient()}>
            Exclude Recipient
          </Button>
          <Button style={{ marginBottom: 25 }} onClick={() => formRecipients.resetFields()}>
            Cancel
          </Button>
          <div style={{ marginBottom: 25 }}>
            <QuestionCircleOutlined className={classes.Icon} onClick={infoModal} />
          </div>
        </Space>
        <div className={classes.Centered}>
          <Divider>Recipients</Divider>
          {getRecElement(recipients)}
        </div>
        {excludeRec.length === 0 && <Divider />}
        {excludeRec.length > 0 && (
          <div className={classes.Centered}>
            <Divider>Exclude Recipients</Divider>
            {getRecElement(excludeRec, true)}
            <Divider />
          </div>
        )}
      </Form>
      <Form form={formMessage} className={classes.Centered} onFinish={values => formFinishHandler(values)}>
        <Form.Item name='subject'>
          <Input placeholder='Subject' />
        </Form.Item>
        <Form.Item name='message' rules={[{ required: true, message: 'Message body is empty' }]}>
          <Input.TextArea
            showCount
            autoSize={{ minRows: 5, maxRows: 10 }}
            allowClear
            placeholder='Message Body'
          />
        </Form.Item>
        <Form.Item>
          <Space style={{ marginTop: 10 }}>
            <Button type='primary' htmlType='submit'>
              Send Message
            </Button>
            <Button
              onClick={() => {
                formMessage.resetFields()
              }}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Spin>
  )
}

const mapStateToProps = state => {
  return {
    grpList: state.groups.groupList,
    usrList: state.users.userList,
    authToken: state.auth.token,
    sending: state.message.loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchGrpList: token => dispatch(fetchGroupList(token)),
    fetchUsrList: (token, groupId, showInactive) => dispatch(fetchUserList(token, groupId, showInactive)),
    sendMsg: (token, data) => dispatch(sendMessage(token, data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Message)
