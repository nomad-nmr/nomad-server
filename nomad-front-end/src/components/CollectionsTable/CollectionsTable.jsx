import React from 'react'
import { Table, Space, Tooltip, Button, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router'
import { FolderOpenOutlined, ShareAltOutlined, DeleteOutlined } from '@ant-design/icons'

import CopyLinkToClipboard from '../CopyLinkToClipboard/CopyLinkToClipboard'
import history from '../../utils/history'

const CollectionsTable = props => {
  const { token } = props
  const navigate = useNavigate()

  const columns = [
    {
      title: 'Username',
      align: 'center',
      width: 150,
      render: record =>
        props.user.accessLevel === 'admin' ? (
          <Button type='link' onClick={() => navigate(`/admin/users?username=${record.username}`)}>
            {record.username}
          </Button>
        ) : (
          <span>{record.username}</span>
        )
    },
    {
      title: 'Group',
      dataIndex: 'group',
      align: 'center',
      width: 150
    },
    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center'
    },
    {
      title: 'Datasets',
      align: 'center',
      dataIndex: 'datasetsCount',
      width: 100
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => dayjs(a.updatedAt) - dayjs(b.updatedAt),
      align: 'center',
      width: 200
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => dayjs(a.updatedAt) - dayjs(b.updatedAt),
      sortDirections: ['descend', 'ascend'],
      align: 'center',
      width: 200
    },
    {
      title: 'Actions',
      width: 250,
      render: record => (
        <Space>
          <Tooltip title='Open collection'>
            <Button
              onClick={() => {
                props.openHandler(token, record.key)
                history.push('/collections/' + record.key)
              }}
            >
              <FolderOpenOutlined />
            </Button>
          </Tooltip>
          <CopyLinkToClipboard id={record.key} path='collections'>
            <Tooltip title='Copy Collection Link' placement='left'>
              <Button icon={<ShareAltOutlined />} />
            </Tooltip>
          </CopyLinkToClipboard>
          <Popconfirm
            placement='left'
            title='Delete the collection'
            description={
              <div>
                <div>
                  Are you sure to delete the collection with title{' '}
                  <span style={{ fontWeight: 600, color: 'red', fontSize: '13px' }}>
                    {record.title}
                  </span>
                  ?
                </div>
                <div style={{ color: 'green' }}>
                  Datasets as well as NMR experiments included in the datasets will remain archived
                  in the datastore!
                </div>
              </div>
            }
            onConfirm={() => props.deleteHandler(record.key, props.token)}
          >
            <Button
              danger
              disabled={
                record.username !== props.user.username && props.user.accessLevel !== 'admin'
              }
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Table
      size='small'
      columns={columns}
      dataSource={props.data}
      loading={props.loading}
      pagination={false}
    />
  )
}

export default CollectionsTable
