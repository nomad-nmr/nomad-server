import React from 'react'
import { Table, Space, Tooltip, Button } from 'antd'
import dayjs from 'dayjs'
import { FolderOpenOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'

const DatasetTable = props => {
  const navigate = useNavigate()

  let columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      align: 'center',
      width: 200
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      align: 'center',
      width: 200
    },
    {
      title: 'Dataset Title',
      dataIndex: 'title',
      align: 'center'
    },
    {
      title: 'Exp Count',
      align: 'center',
      dataIndex: 'expCount',
      width: 100
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      align: 'center'
    },

    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      align: 'center',
      width: 150
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      align: 'center',
      width: 150
    },
    {
      title: 'Actions',
      render: record => (
        <Space>
          <Tooltip title='Open in NMRium'>
            <Button type='link' onClick={() => navigate('/nmrium/' + record.key)}>
              <FolderOpenOutlined />
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]
  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      loading={props.loading}
      pagination={false}
    />
  )
}

export default DatasetTable
