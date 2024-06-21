import React from 'react'
import { Tooltip, Tag, Divider } from 'antd'

const UsrGrpTags = props => {
  const tagStyle = { fontSize: '0.9rem', marginTop: 10 }
  return (
    <div style={{ marginBottom: 20 }}>
      <Tag color='cyan' style={tagStyle}>
        Group
      </Tag>
      <Tag color='green' style={tagStyle}>
        User
      </Tag>
      <span style={{ marginRight: '8px' }}>:</span>
      {props.state.map((entry, index) => {
        const color = entry.type === 'group' ? 'cyan' : entry.type === 'user' ? 'green' : 'orange'
        return (
          <Tag
            key={index}
            closable
            style={tagStyle}
            color={color}
            onClose={e => {
              e.preventDefault()
              props.removeEntry(entry.id)
            }}
          >
            <Tooltip title={entry.type === 'user' && entry.fullName}>{entry.name}</Tooltip>
          </Tag>
        )
      })}
    </div>
  )
}

export default UsrGrpTags
