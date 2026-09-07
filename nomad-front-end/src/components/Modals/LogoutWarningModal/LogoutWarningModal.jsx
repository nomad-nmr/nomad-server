import React, { useState, useEffect } from 'react'
import { Modal, Button, Space } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

//formats remaining milliseconds as mm:ss
const formatCountdown = ms => {
  const totalSeconds = Math.max(Math.round(ms / 1000), 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const LogoutWarningModal = props => {
  const { visible, logoutAt, loading, stayClicked, signOutClicked, cancelClicked } = props

  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!visible || !logoutAt) {
      return
    }
    setRemaining(logoutAt - new Date().getTime())
    const intervalId = setInterval(() => {
      setRemaining(logoutAt - new Date().getTime())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [visible, logoutAt])

  return (
    <Modal
      width='350px'
      title={
        <div style={{ color: '#faad14' }}>
          <ExclamationCircleOutlined />{' '}
          <span style={{ marginLeft: '10px' }}>Session about to expire</span>
        </div>
      }
      open={visible}
      footer={null}
      onCancel={cancelClicked}
    >
      <p style={{ marginTop: '20px' }}>
        You will be automatically signed out in{' '}
        <span style={{ fontWeight: 600 }}>{formatCountdown(remaining)}</span>
      </p>
      <div style={{ textAlign: 'center', marginTop: '25px' }}>
        <Space>
          <Button type='primary' loading={loading} onClick={stayClicked}>
            Stay signed in
          </Button>
          <Button onClick={signOutClicked}>Sign out</Button>
          <Button onClick={cancelClicked}>Cancel</Button>
        </Space>
      </div>
    </Modal>
  )
}

export default LogoutWarningModal
