import React from 'react'
import { Table } from 'antd'
import dayjs from 'dayjs'

const ColectionsTable = props => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center'
    },
    {
      title: 'Datasets Count',
      align: 'center',
      dataIndex: 'datasetsCount',
      width: 200
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => a.createdAt - b.createdAt,
      align: 'center',
      width: 200
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: record => (record ? dayjs(record).format('DD-MMM-YY HH:mm') : '-'),
      sorter: (a, b) => a.updatedAt - b.updatedAt,
      sortDirections: ['descend', 'ascend'],
      align: 'center',
      width: 200
    },
    {
      title: 'Actions',
      width: 300
    }
  ]

  const dataSource = [{ key: '1', title: 'Test' }]

  return <Table columns={columns} dataSource={props.data.collections} loading={props.loading} />
}

export default ColectionsTable
