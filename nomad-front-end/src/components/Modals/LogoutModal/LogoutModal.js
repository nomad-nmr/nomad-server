import React from 'react'
import { Modal, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Text } = Typography

const LogoutModal = props => {
  const { visible, token, okClicked, cancelClicked } = props
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <Modal
      width='300px'
      title={
        <div style={{ color: '#faad14' }}>
          <ExclamationCircleOutlined /> <span style={{ marginLeft: '10px' }}>Sign out</span>{' '}
        </div>
      }
      okText='Sign out'
      visible={visible}
      onOk={() => {
        //user should stay on /batch-submit page after log out
        if (location.pathname !== '/batch-submit' && location.pathname !== '/search') {
          navigate('/')
        }
        okClicked(token)
      }}
      onCancel={cancelClicked}
    >
      <Text strong>Do you want to sign out?</Text>
    </Modal>
  )
}

export default LogoutModal
