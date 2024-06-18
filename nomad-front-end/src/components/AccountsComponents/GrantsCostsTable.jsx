import React from 'react'
import { Table } from 'antd'
import CostingTable from './CostingTable'

const GrantsCostsTable = props => {
  const columns = [
    {
      title: 'Grant Code',
      dataIndex: 'grantCode',
      width: 300
      // align: 'center'
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      width: 200,
      align: 'center'
    }
  ]

  return (
    <div style={{ margin: '30px' }}>
      <Table columns={columns} dataSource={props.data} pagination={false} size='small' />
    </div>
  )
}

export default GrantsCostsTable
