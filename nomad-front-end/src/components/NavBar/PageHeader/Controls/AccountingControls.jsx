import React, { Fragment } from 'react'
import { Button, Space, Divider, Input } from 'antd'
import { CSVLink } from 'react-csv'
import dayjs from 'dayjs'
import { CloudDownloadOutlined } from '@ant-design/icons'

import classes from '../PageHeader.module.css'

const AccountingControls = props => {
  const { Search } = Input
  const {
    setGrantsVisible,
    tableData,
    tableHeader,
    accType,
    groupName,
    searchHandler,
    searchDefValue
  } = props
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

  let controlElements = (
    <Fragment>
      <Button
        className={{ ...classes.Button }}
        style={{ marginLeft: '10px' }}
        type='primary'
        onClick={() => props.toggleCostDrawer()}
      >
        Set Instruments Costing
      </Button>
      <Button
        type={'primary'}
        onClick={() => props.toggleSetGrants()}
        style={{ marginLeft: '10px' }}
      >
        Set Grants
      </Button>
      <Divider type='vertical' />

      <CSVLink
        aria-disabled={!tableData[1]}
        data={dataParser(tableHeader, tableData, accType)}
        filename={`${accType} Accounting ${
          accType === 'Users' && groupName ? '[' + groupName + '] ' : ''
        }${dayjs().format('DD-MM-YY HH_mm')} .csv`}
      >
        <Button disabled={!tableData[1]} icon={<CloudDownloadOutlined />}>
          Download CSV
        </Button>
      </CSVLink>
    </Fragment>
  )

  if (setGrantsVisible) {
    controlElements = (
      <Fragment>
        <Button
          type='primary'
          onClick={() => props.toggleAddGrant()}
          style={{ marginLeft: '10px' }}
        >
          Add Grant
        </Button>
        <Search
          placeholder='description'
          allowClear
          onSearch={searchHandler}
          style={{ width: 150, marginLeft: '10px' }}
          defaultValue={searchDefValue}
        />
        <Divider type='vertical' />
        <Button
          className={{ ...classes.Button, marginLeft: '10px' }}
          onClick={() => props.toggleSetGrants()}
        >
          Close & Return
        </Button>
      </Fragment>
    )
  }

  return (
    <Space className={{ ...classes.ExtraContainer }} style={{ flexWrap: 'wrap' }}>
      {controlElements}
    </Space>
  )
}

export default AccountingControls
