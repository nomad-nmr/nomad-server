import React from 'react'
import { Table } from 'antd'

import classes from './AccountsTable.module.css'

const AccountsTable = props => {
  const columns = [
    {
      title: props.header,
      width: 35,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      align: 'center',
      className: classes.NameHighlight
    }
  ]

  //add the grantCode column if data are for user calculation
  if (props.header === 'User Name') {
    columns.push({
      title: 'Grant Code',
      width: 35,
      dataIndex: 'grantCode',
      key: 'grantCode',
      fixed: 'left',
      align: 'center'
    })
  }

  //Getting dynamic table headers from the first data object
  props.data[0].costsPerInstrument.forEach((cost, index) => {
    columns.push({
      title: cost.instrument,
      children: [
        {
          title: 'Exp Time',
          children: [
            {
              title: 'Manual',
              dataIndex: 'expTimeClaims' + index,
              align: 'center',
              width: 20
            },
            {
              title: 'Auto',
              dataIndex: 'expTimeAuto' + index,
              align: 'center',
              width: 20
            }
          ]
        },
        {
          title: 'Cost [£]',
          dataIndex: 'cost' + index,
          align: 'center',
          width: 20,
          render: record => <span style={{ color: 'blue' }}>{record}</span>
        }
      ]
    })
  })
  //adding total column header
  columns.push({
    title: 'Total Cost [£]',
    dataIndex: 'totalCost',
    align: 'center',
    fixed: 'right',
    width: 25,
    className: classes.ColHighlight
  })

  const data = props.data.map((entry, key) => {
    const newEntry = {
      name: entry.name,
      grantCode: entry.grantCode || undefined,
      totalCost: entry.totalCost,
      key
    }
    entry.costsPerInstrument.forEach((instr, index) => {
      newEntry['expTimeClaims' + index] = instr.expTimeClaims
      newEntry['expTimeAuto' + index] = instr.expTimeAuto
      newEntry['cost' + index] = instr.cost
    })
    return newEntry
  })

  return (
    <div style={{ margin: '0 50px 0 50px', height: 'fit-content' }}>
      <Table
        columns={columns}
        dataSource={data}
        bordered={true}
        size='small'
        pagination={false}
        rowClassName={record => record.name === 'Total' && classes.RowHighlight}
        scroll={{ x: 1500, y: 500 }}
      />
    </div>
  )
}

export default AccountsTable
