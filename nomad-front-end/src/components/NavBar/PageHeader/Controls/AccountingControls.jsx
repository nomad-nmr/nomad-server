import React from 'react'
import { Button, Space, Divider } from 'antd'
import { generateCSV } from "react-make-csv";
import classes from '../PageHeader.module.css'

const columnsParser = (head, data) => {
  let columns = [head]
  let presentColumns = data[0].costsPerInstrument;
  presentColumns.forEach(({ instrument }) => {
    const newColumnsToAdd = [
      instrument + " Exp Time Manual",
      instrument + " Exp Time Auto",
      instrument + " Exp Time Cost [£]"
    ]
    columns = [...columns, ...newColumnsToAdd]

  });

  return columns;
}

const rowsParser = (data) => {
    //column names are done, now do the data
    const rows = [];
    data.forEach(row=>{
      let FlatRow = [row.name];
      row.costsPerInstrument.forEach(instrumentData=>{
        const {cost, expTimeAuto, expTimeClaims} = instrumentData
        FlatRow = [...FlatRow, expTimeClaims, expTimeAuto, cost]
      })
      //now push the flattened row
      rows.push(FlatRow)
    })
    return rows
}

const dataParser = (head, data) => {
  //add columns to first row
  let rows = [columnsParser(head, data), ...rowsParser(data)];
  console.log(rows)
  return rows;

}

const downloadCSV = (head, data) =>{
  dataParser(head, data)
  generateCSV(dataParser(head, data), 'accounting-exports')
}

const AccountingControls = props => {
  const { setGrantsVisible, loading, tableData, tableHeader } = props
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
      <Divider type="vertical" />
      <Button onClick={()=>(downloadCSV(tableHeader, tableData))} loading={loading} type='primary'>
        Export as CSV
      </Button>
    </Space>
  )
}

export default AccountingControls
