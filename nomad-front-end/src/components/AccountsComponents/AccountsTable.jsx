import React from 'react'
import { Table, Tooltip } from 'antd'

import classes from './AccountsTable.module.css'

const AccountsTable = props => {
  console.log(props)
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

  //add the grantcode if it exists
  if (props.data[0].grantCode) {
    columns.push({
      title: 'Grant Code',
      width: 35,
      dataIndex: 'grantCode',
      key: 'grantCode',
      fixed: 'left',
      align: 'center',
      render: (text, record) => {
        return (record.grantCode && <Tooltip title={`ID: ${record.grantCode?.grantId} \n mutiplier: ${record.grantCode?.multiplier}`}>
          <p style={{ color: 'blue' }}>See Grants Info</p>
        </Tooltip>)
      }

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
