import React from 'react'
import { Tag } from 'antd'

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloudServerOutlined
} from '@ant-design/icons'

const StatusTag = props => {
  const { text } = props
  switch (text) {
    case 'Archived':
      return (
        <Tag icon={<CloudServerOutlined />} color='purple'>
          {text}
        </Tag>
      )
    case 'Completed':
      return (
        <Tag icon={<CheckCircleOutlined />} color='success'>
          {text}
        </Tag>
      )
    case 'Error':
      return (
        <Tag icon={<CloseCircleOutlined />} color='error'>
          {text}
        </Tag>
      )
    case 'Booked':
      return (
        <Tag icon={<DownCircleOutlined />} color='gold'>
          {text}
        </Tag>
      )
    case 'Submitted':
      return (
        <Tag icon={<ClockCircleOutlined />} color='default'>
          {text}
        </Tag>
      )
    case 'Running':
      return (
        <Tag icon={<SyncOutlined spin />} color='processing'>
          {text}
        </Tag>
      )

    default:
      return <Tag color='default'>{text ? text : 'undefined'}</Tag>
  }
}

export default StatusTag
