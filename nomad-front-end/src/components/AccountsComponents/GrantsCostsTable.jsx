import React, { useState } from 'react'
import { Table, Alert, Flex, Button, Tag, Space, Tooltip } from 'antd'

const GrantsCostsTable = props => {
  const { alertData } = props

  const alertVisible = alertData && (alertData.expsCount > 0 || alertData.claimsCount > 0)

  const [detailVisible, setDetailVisible] = useState(false)

  const columns = [
    {
      title: 'Grant Code',
      dataIndex: 'grantCode',
      width: 300
    },
    {
      title: 'Description',
      dataIndex: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description)
    },
    {
      title: 'Cost [£]',
      children: [
        {
          title: 'Manual',
          dataIndex: 'costClaims',
          width: 100,
          align: 'center'
        },
        { title: 'Auto', dataIndex: 'costExps', width: 100, align: 'center' },
        { title: 'Total', dataIndex: 'totalCost', width: 100, align: 'center' }
      ]
    }
  ]

  const detailInfo = (
    <div style={{ marginTop: '15px' }}>
      <Flex justify='space-around'>
        <div>
          <strong>Experiments: </strong>
          {alertData.expsCount}{' '}
        </div>
        <div>
          <strong>Claims: </strong>
          {alertData.claimsCount}{' '}
        </div>
      </Flex>
      <Flex justify='center' style={{ marginTop: '10px' }}>
        <strong>Users:</strong>
        {alertData.users.map(user => (
          <Tooltip title={user.fullName}>
            <Tag style={{ marginLeft: '7px' }}>{user.username}</Tag>
          </Tooltip>
        ))}
      </Flex>
    </div>
  )

  const expandElement = record => (
    <Space>
      Users:
      {record.usersArray.map(user => (
        <Tooltip title={user.fullName}>
          <Tag>{user.username}</Tag>
        </Tooltip>
      ))}
    </Space>
  )
  return (
    <Flex vertical={true} align='center' style={{ margin: '30px 50px' }}>
      <Table
        columns={columns}
        dataSource={props.data}
        pagination={false}
        size='small'
        tableLayout='fixed'
        width='80%'
        expandable={{ expandedRowRender: expandElement }}
      />
      {alertVisible && (
        <Alert
          message=<span style={{ fontWeight: 600 }}>Warning!</span>
          type='warning'
          showIcon
          description=<div>
            Some experiments or claims were not assigned to a grant
            {detailVisible && detailInfo}
          </div>
          style={{ marginTop: '50px', width: '600px' }}
          action={
            <Button size='small' danger onClick={() => setDetailVisible(true)}>
              Detail
            </Button>
          }
        />
      )}
    </Flex>
  )
}

export default GrantsCostsTable
