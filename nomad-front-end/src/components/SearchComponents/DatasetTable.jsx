import React from 'react'
import { Table, Space, Tooltip, Button, Modal } from 'antd'
import dayjs from 'dayjs'
import Icon, { FolderOpenOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'

import structureIconSVG from './StructureIcon'

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
          <Tooltip title='Show chemical structures'>
            <Button
              onClick={() => showStructure(record)}
              disabled={record.molSVGs.length === 0}
              icon={<Icon component={structureIconSVG} />}
            />
          </Tooltip>
          <Tooltip title='Open in NMRium'>
            <Button onClick={() => navigate('/nmrium/' + record.key)}>
              <FolderOpenOutlined />
            </Button>
          </Tooltip>
          <Tooltip title='Download dataset'>
            <Button onClick={() => props.onDownloadDataset(record.key, record.title, props.token)}>
              <DownloadOutlined />
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

const showStructure = record => {
  const svgElements = record.molSVGs.map(i => <div dangerouslySetInnerHTML={{ __html: i.svg }} />)
  return Modal.info({
    content: <Space>{svgElements}</Space>,
    icon: null,
    okText: 'Close',
    width: record.molSVGs.length * 200
  })
}

export default DatasetTable
