import React from 'react'
import DOMPurify from 'dompurify'
import 'react-quill/dist/quill.snow.css'   // <-- make sure this is imported here too

import { Alert } from 'antd'
import { WarningOutlined, InfoCircleOutlined, NotificationOutlined } from '@ant-design/icons'

const Announcement = ({ announcement }) => {
  if (!announcement) {
    return null
  }
  const kindConfig = {
    warning: { icon: <WarningOutlined style={{ color: '#a8071a' }} />, style: { border: '1px solid #ff4d4f', backgroundColor: '#fff2f0', color: '#a8071a' } },
    info: { icon: <InfoCircleOutlined style={{ color: '#1677ff' }} />, style: { border: '1px solid #1677ff', backgroundColor: '#e6f4ff', color: '#0958d9' } },
    news: { icon: <NotificationOutlined style={{ color: '#52c41a' }} />, style: { border: '1px solid #52c41a', backgroundColor: '#f6ffed', color: '#389e0d' } }
  }

  const config = kindConfig[announcement.kind] || kindConfig.info

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Alert
        message={<strong>{announcement.title || 'Announcement'}</strong>}
        description={
          <div
            className="ql-editor"
            style={{ padding: 0 }}   // ql-editor has its own padding, kill it so it doesn't fight the Alert layout
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.body) }}
          />
        }
        icon={config.icon}
        showIcon
        style={config.style}
        closable={false}
      />
    </div>
  )
}

export default Announcement