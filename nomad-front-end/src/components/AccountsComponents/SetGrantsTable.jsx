import React from 'react'
import { Table, Tag, Space, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

const SetGrantsTable = props => {
  const { token } = props
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
      title: 'Costing multiplier',
      dataIndex: 'multiplier',
      width: 150,
      align: 'center'
    },
    {
      title: 'Include',
      align: 'center',
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
      title: 'Actions',
      align: 'center',
      render: record => (
        <Space>
          <Button
            type='link'
            size='small'
            onClick={() => {
              props.formHandler(true)
              setTimeout(() => {
                props.formRef.current.setFieldsValue(record)
                props.setTagsState(
                  record.include.map(i => ({ ...i, type: i.isGroup ? 'group' : 'user' }))
                )
              }, 200)
            }}
          >
            Edit
          </Button>
          <Popconfirm
            placement='right'
            title='Delete grant'
            description={
              <div>
                Are you sure to delete the grant{' '}
                <span style={{ fontWeight: 600, color: 'red', fontSize: '13px' }}>
                  {record.grantCode}
                </span>
                ?
              </div>
            }
            onConfirm={() => props.deleteHandler(token, record.key)}
          >
            <Button icon={<DeleteOutlined />} danger size='small' />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ margin: '30px' }}>
      <Table columns={columns} dataSource={props.data} pagination={false} size='small' />
    </div>
  )
}

export default SetGrantsTable
