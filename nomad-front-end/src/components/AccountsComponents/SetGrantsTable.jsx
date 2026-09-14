import React, { useEffect, useState } from 'react'
import { Table, Tag, Space, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

const SetGrantsTable = props => {
  const { token, data, searchTerm } = props
  const [modifiedData, setModifiedData] = useState(data);
  useEffect(()=>{
    const activeData = data.filter(item => !item.archived);
    setModifiedData(activeData);
    if (searchTerm.trim() !== '') {
      const filteredData = activeData.filter(item => {
        return item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
      })
      setModifiedData(filteredData);
    }
  }, [data, searchTerm])
  const columns = [
    {
      title: 'Grant Code',
      dataIndex: 'grantCode'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      sorter: (a, b) =>
        (a.description || '').localeCompare(b.description || '')
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
            title='Archive grant'
            description={
              <div>
                Are you sure to archive the grant{' '}
                <span style={{ fontWeight: 600, color: 'red', fontSize: '13px' }}>
                  {record.grantCode}
                </span>
                ?
              </div>
            }
            onConfirm={() => props.archiveHandler(token, record.key)}
          >
            <Button type='link' size='small'>
              Archive
            </Button>
          </Popconfirm>
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
      <Table columns={columns} dataSource={modifiedData} pagination={false} size='small' />
    </div>
  )
}

export default SetGrantsTable
