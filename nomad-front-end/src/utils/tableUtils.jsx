import { Tag } from 'antd'

//Utility functions that adds key property into any table data object retrieve from the server
//Allowing to render antD table component

export const addKey = tableData =>
  tableData.map((i, index) => {
    return { ...i, key: index }
  })

// Helper function for adding property into the row object that will be used to highlight rows with the same ExpNo
export const highlightRows = tableData => {
  let highlight = false
  const newTableData = tableData.map((row, index) => {
    const prevRow = tableData[index - 1]
    if (prevRow && prevRow.datasetName !== row.datasetName) {
      highlight = !highlight
    }
    return { ...row, highlight }
  })
  return newTableData
}

//Helper function for use in reducer to update boolean property (switch) in data tables
export const updateTableSwitch = (tableData, key, id) => {
  const updatedTableData = [...tableData]
  const index = updatedTableData.findIndex(i => i._id.toString() === id.toString())
  updatedTableData[index][key] = !updatedTableData[index][key]
  return updatedTableData
}

export const renderDataAccess = text => {
  let color = undefined

  switch (text) {
    case 'user':
      color = 'blue'
      break
    case 'group':
      color = 'purple'
      break
    case 'admin-b':
      color = 'orange'
      break
    case 'admin':
      color = 'red'
      break
    default:
      break
  }

  return <Tag color={color}>{text ? text : 'undefined'}</Tag>
}
