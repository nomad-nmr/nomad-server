//new keys for status and history data objects
const statusKeysArr = [
  'holder',
  'status',
  'datasetName',
  'expNo',
  'parameterSet',
  'group',
  'time',
  'title'
]
const historyKeysArr = [
  'time',
  'datasetName',
  'expNo',
  'parameterSet',
  'group',
  'load',
  'atma',
  'spin',
  'lock',
  'shim',
  'proc',
  'acq',
  'title',
  'remarks',
  'holder'
]

//Helper function for sanitation of status and history raw table data array
const addNewKeys = (rawDataArr, keys) => {
  //removing first object containing old keys
  if (rawDataArr) {
    rawDataArr.splice(0, 1)
  }

  const newTableData = []
  //Creating new object for each row using the array of new keys
  if (rawDataArr) {
    rawDataArr.forEach(row => {
      const values = Object.values(row)
      let newRowObj = keys.reduce((o, key, index) => ({ ...o, [key]: values[index] }), {})

      // Extracting username from dataset name
      // TODO: username could be extracted from title (originator item in IconNMR). Allow to change through instrument settings
      newRowObj = { ...newRowObj, username: newRowObj.datasetName.split('-')[3] }

      newTableData.push(newRowObj)
    })
  }

  return newTableData
}

const restructureInput = (input, instrument, batchGroups) => {
  const statusTable = addNewKeys(input[1], statusKeysArr) || []
  const historyTable = addNewKeys(input[2], historyKeysArr) || []

  //checking whether there is a running experiment
  const running = statusTable.find(entry => entry.status === 'Running') ? true : false

  //Calculation of available holders
  const usedHolders = new Set()
  statusTable.forEach(entry => usedHolders.add(entry.holder))
  const availableHolders = instrument.capacity - usedHolders.size

  // Calculating number of errors and
  const errorCount = statusTable.filter(entry => entry.status === 'Error').length
  const pendingCount = statusTable.filter(
    entry => entry.status === 'Available' && !batchGroups.includes(entry.group)
  ).length

  const summary = {
    ...instrument.status.summary,
    busyUntil: running ? Object.values(input[0][2])[1] : 'Idle',
    dayExpt: Object.values(input[0][1])[1],
    nightExpt: Object.values(input[0][3])[1],
    running,
    availableHolders,
    errorCount,
    pendingCount
  }

  return { summary, statusTable, historyTable }
}

module.exports = restructureInput
