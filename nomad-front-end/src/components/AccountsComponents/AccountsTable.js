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

  //Getting dynamic table headers from the first data object
  props.data[0].costsPerInstrument.forEach((cost, index) => {
    columns.push({
      title: cost.instrument,
      children: [
        {
          title: 'Exp Count',
          dataIndex: 'expCount' + index,
          align: 'center',
          width: 20
        },
        {
          title: 'Exp Time',
          dataIndex: 'expTime' + index,
          align: 'center',
          width: 20
        },
        {
          title: 'Cost [£]',
          dataIndex: 'cost' + index,
          align: 'center',
          width: 20
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
      totalCost: entry.totalCost,
      key
    }
    entry.costsPerInstrument.forEach((instr, index) => {
      newEntry['expCount' + index] = instr.expCount
      newEntry['expTime' + index] = instr.expT
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
