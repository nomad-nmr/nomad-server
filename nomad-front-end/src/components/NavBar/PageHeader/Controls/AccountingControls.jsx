import React from 'react'
import { Button, Space, Divider } from 'antd'
import classes from '../PageHeader.module.css'
import { CSVLink } from 'react-csv'
import dayjs from 'dayjs'
import { CloudDownloadOutlined } from '@ant-design/icons'

const AccountingControls = props => {
  const { setGrantsVisible, tableData, tableHeader, accType, groupName } = props
  const standardColumns = {
    grants: ['Grant Code', 'Description', 'Users', 'Manual Cost', 'Auto Cost', 'Total Cost [£]']
  }
  const columnsParser = (head, data, type) => {
    let columns = []

    if (type === 'Grants') {
      columns = standardColumns.grants
    } else {
      columns = [head]
      if (type === 'Users') {
        columns = [...columns, 'Grant Code']
      }
      let presentColumns = data[0].costsPerInstrument
      presentColumns.forEach(({ instrument }) => {
        const newColumnsToAdd = [
          instrument + ' Exp Time Manual',
          instrument + ' Exp Time Auto',
          instrument + ' Cost [£]'
        ]
        columns = [...columns, ...newColumnsToAdd]
      })
      columns = [...columns, 'Total Cost [£]']
    }

    return columns
  }

  const rowsParser = (data, type) => {
    //column names are done, now do the data
    let rows = []

    if (type === 'Grants') {
      data.forEach(row => {
        let flatrow = []
        //destructure important stuff
        const { costExps, costClaims, grantCode, description, totalCost, usersArray } = row

        //flatten the users array as text
        let users = usersArray.map(userOBJ => `${userOBJ.username} (${userOBJ.fullName})`)

        //finalize
        flatrow = [grantCode, description, users.join(', '), costClaims, costExps, totalCost]

        //add to the rows
        rows = [...rows, flatrow]
      })
    } else {
      data.forEach(row => {
        let FlatRow = [row.name]

        if (type === 'Users') {
          FlatRow = [...FlatRow, row.grantCode]
        }

        row.costsPerInstrument.forEach(instrumentData => {
          const { cost, expTimeAuto, expTimeClaims } = instrumentData
          FlatRow = [...FlatRow, expTimeClaims, expTimeAuto, cost]
        })
        //now add the total cost
        FlatRow = [...FlatRow, row.totalCost]
        //now push the flattened row
        rows.push(FlatRow)
      })
    }
    return rows
  }

  const dataParser = (head, data, type) => {
    let rows = data[1] ? [columnsParser(head, data, type), ...rowsParser(data, type)] : []
    return rows
  }

  return (
    <Space className={classes.ExtraContainer}>
      <Button className={classes.Button} type='primary' onClick={() => props.toggleCostDrawer()}>
        Set Instruments Costing
      </Button>
      <Divider type='vertical' />
      <Button type={!setGrantsVisible && 'primary'} onClick={() => props.toggleSetGrants()}>
        {setGrantsVisible ? 'Close & Return' : 'Set Grants'}
      </Button>
      {setGrantsVisible && (
        <Button type='primary' onClick={() => props.toggleAddGrant()}>
          Add Grant
        </Button>
      )}
      <Divider type='vertical' />
      <CSVLink
        aria-disabled={!tableData[1]}
        data={dataParser(tableHeader, tableData, accType)}
        filename={`${accType} Accounting ${
          accType === 'Users' && groupName ? '[' + groupName + '] ' : ''
        }${dayjs().format('DD-MM-YY HH_mm')} .csv`}
      >
        <Button icon={<CloudDownloadOutlined />}>Download CSV</Button>
      </CSVLink>
    </Space>
  )
}

export default AccountingControls
