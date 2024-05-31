import React from 'react'
import { Table, Tag } from 'antd'

const GrantsTable = props => {
  const columns = [
    {
      title: 'Grant Code',
      dataIndex: 'grantCode'
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Include',
      render: record => (
        <div>
          {record.include.map(i => {
            const tagColor = i.isGroup ? 'cyan' : 'green'
            return (
              <Tag color={tagColor} key={i.id}>
                {i.name}
              </Tag>
            )
          })}
        </div>
      )
    },
    {
      title: 'Exclude'
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center'
    },
    {
      title: 'Actions',
      align: 'center'
    }
  ]

  return (
    <div style={{ margin: '0 30px' }}>
      <Table columns={columns} dataSource={props.data} pagination={false} size='small' />
    </div>
  )
}

export default GrantsTable
