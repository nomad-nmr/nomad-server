const Instrument = require('../models/instrument')
const Group = require('../models/group')
const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')

exports.getStatusSummary = async (req, res) => {
  try {
    const data = await Instrument.find(
      { isActive: true },
      '-status.statusTable -status.historyTable'
    )
    if (!data) {
      return res.status(404).send()
    }
    res.send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.getStatusTable = async (req, res) => {
  try {
    let data = null
    //instrId is unknown and set to 0 when  the dashboard reloads
    if (req.params.instrId !== '0') {
      data = await Instrument.findById(req.params.instrId, 'status.statusTable')
    } else {
      const instrArr = await Instrument.find({ isActive: 'true' }, 'status.statusTable')
      data = instrArr[0]
    }
    if (!data) {
      return res
        .status(409)
        .send('No instruments found in database. Add instrument in Settings/Instruments')
    }

    //Filtering off entries in the table with 'Available'(Pending) status
    const filteredData = data.status.statusTable.filter(entry => entry.status !== 'Available')

    //Creating data structure for nested expandable tables
    const tableData = []
    let newRow = { exps: [] }
    filteredData.forEach((row, index) => {
      const prevRow = filteredData[index - 1]
      const nextRow = filteredData[index + 1]

      const newExp = {
        key: row.expNo,
        expNo: row.expNo,
        parameterSet: row.parameterSet,
        parameters: row.parameters,
        title: row.title,
        expT: row.time,
        status: row.status,
        updatedAt: row.updatedAt
      }

      if (index === 0 || prevRow.datasetName !== row.datasetName) {
        newRow = { exps: [] }
        newRow.key = row.holder
        newRow.holder = row.holder
        newRow.username = row.username
        newRow.group = row.group
        newRow.datasetName = row.datasetName
        newRow.solvent = row.solvent
        newRow.time = row.time
        newRow.night = row.night
        newRow.priority = row.priority
        newRow.status = row.status
        newRow.submittedAt = row.submittedAt
        newRow.exps = []
      } else {
        newRow.time = moment
          .duration(newRow.time)
          .add(moment.duration(row.time))
          .format('HH:mm:ss', { trim: false })

        if (row.status === 'Error' || row.status === 'Running') {
          newRow.status = row.status
        } else if (row.status === 'Submitted' && newRow.status === 'Completed') {
          newRow.status = 'Submitted'
        }
      }

      newRow.exps.push(newExp)

      if (!nextRow || nextRow.datasetName !== row.datasetName) {
        tableData.push(newRow)
      }
    })

    res.send(tableData)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

exports.getDrawerTable = async (req, res) => {
  try {
    const data = await Instrument.find(
      { isActive: true },
      '_id available name status.statusTable status.historyTable overheadTime'
    )
    if (!data) {
      return res.status(404).send()
    }

    const batchGroups = await Group.find({ isBatch: true, isActive: true }, 'groupName')
    const batchGroupsArr = batchGroups.map(group => group.groupName)

    let respArray = []
    // pending experiments have status "available" in and errors "error" in the source data table
    const statusId =
      req.params.id === 'pending'
        ? 'available'
        : req.params.id === 'errors'
        ? 'error'
        : req.params.id

    data.forEach(i => {
      let filteredArray = []
      let respArrayChunk = []

      filteredArray = i.status.statusTable.filter(
        row => row.status.toLowerCase() === statusId.toLowerCase()
      )

      if (req.params.id === 'errors') {
        respArrayChunk = filteredArray.map(row => {
          const histObject = i.status.historyTable.find(
            i => row.datasetName === i.datasetName && row.expNo === i.expNo
          )
          if (histObject) {
            return { ...row, description: histObject.remarks }
          } else {
            return row
          }
        })
      } else if (req.params.id === 'pending') {
        let expCount = 0
        let newRow = {}
        filteredArray
          .filter(row => !batchGroupsArr.includes(row.group))
          .forEach((row, index) => {
            const prevRow = filteredArray[index - 1]
            const nextRow = filteredArray[index + 1]

            if (index === 0 || prevRow.datasetName !== row.datasetName) {
              expCount = 1
            }
            if (!nextRow || nextRow.datasetName !== row.datasetName) {
              newRow = {
                ...row,
                title: row.title.split('||')[0],
                instrId: i._id,
                expCount
              }
              delete newRow.expNo
              delete newRow.parameterSet
              respArrayChunk.push(newRow)
            }
            expCount++
          })
      } else {
        //adding overheadTime to calculate correctly remaining expt for "Running experiments" on front end.
        respArrayChunk = filteredArray.map(row => ({ ...row, overheadTime: i.overheadTime }))
      }

      respArray = respArray.concat(respArrayChunk.map(row => ({ ...row, instrument: i.name })))
    })
    res.send(respArray)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
