const moment = require('moment')

const Experiment = require('../../models/experiment')
const Group = require('../../models/group')
const User = require('../../models/user')
const Instrument = require('../../models/instrument')

exports.getCosts = async (req, res) => {
  const { groupId, dateRange } = req.query
  try {
    const searchParams = { $and: [{ status: 'Archived' }] }

    if (dateRange && dateRange !== 'undefined' && dateRange !== 'null') {
      const datesArr = dateRange.split(',')
      searchParams.$and.push({
        updatedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    const resData = []
    const instrumentList = await Instrument.find({ isActive: true }, 'name cost')

    if (groupId === 'undefined') {
      //each entry of the table is group
      const groupList = await Group.find({ isActive: true }, 'groupName')

      await Promise.all(
        groupList.map(async entry => {
          const newEntry = { name: entry.groupName, costsPerInstrument: [], totalCost: 0 }

          //adding group or user into search parameters
          const entrySearchParams = {}
          entrySearchParams.$and = [...searchParams.$and, { 'group.id': entry._id }]

          const expArray = await Experiment.find(entrySearchParams, 'instrument totalExpTime')

          instrumentList.forEach((i, index) => {
            const filteredExpArray = expArray.filter(exp => exp.instrument.name === i.name)
            const expT = getExpTimeSum(filteredExpArray)
            const cost = Math.round(moment.duration(expT).asHours() * i.cost * 100) / 100
            // console.log(cost)
            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expCount: filteredExpArray.length,
              expT,
              cost
            })
            newEntry.totalCost += cost
          })
          resData.push(newEntry)
        })
      )
    } else {
      //each entry of the table is user

      searchParams.$and = [...searchParams.$and, { 'group.id': groupId }]

      const expArray = await Experiment.find(searchParams, 'instrument totalExpTime user')

      //getting list of users out of experiment array
      //to make sure that lists include users that have been moved to a different group
      const usrSet = new Set()
      expArray.forEach(exp => usrSet.add(exp.user.id.toString()))
      const usrArray = Array.from(usrSet)

      await Promise.all(
        usrArray.map(async usrId => {
          const user = await User.findById(usrId)
          const usrInactive = !user.isActive || user.group.toString() !== groupId
          const newEntry = {
            name: `${user.username} - ${user.fullName} ${usrInactive ? '(Inactive)' : ''}`,
            costsPerInstrument: [],
            totalCost: 0
          }

          instrumentList.forEach(i => {
            const filteredExpArray = expArray.filter(
              exp => exp.instrument.name === i.name && exp.user.id.toString() === usrId
            )
            const expT = getExpTimeSum(filteredExpArray)
            const cost = Math.round(moment.duration(expT).asHours() * i.cost * 100) / 100
            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expCount: filteredExpArray.length,
              expT,
              cost
            })
            newEntry.totalCost += cost
          })

          newEntry.totalCost = newEntry.totalCost

          resData.push(newEntry)
        })
      )
    }

    //Calculation of the last row (Total) sum of columns
    const totalEntry = {
      name: 'Total',
      costsPerInstrument: [],
      totalCost: 0
    }

    if (resData.length === 0) {
      return res.send([])
    }

    resData[0].costsPerInstrument.forEach((col, colIndex) => {
      const expCountSumArr = []
      const costSumArr = []
      const expTimeSumArr = []
      resData.forEach(row => {
        expCountSumArr.push(row.costsPerInstrument[colIndex].expCount)
        costSumArr.push(row.costsPerInstrument[colIndex].cost)
        expTimeSumArr.push(moment.duration(row.costsPerInstrument[colIndex].expT).asSeconds())
      })
      totalEntry.costsPerInstrument.push({
        instrument: col.instrument,
        expCount: expCountSumArr.reduce((a, b) => a + b, 0),
        cost: Math.round(costSumArr.reduce((a, b) => a + b, 0) * 100) / 100,
        expT: moment
          .duration(
            expTimeSumArr.reduce((a, b) => a + b, 0),
            'seconds'
          )
          .format('HH:mm:ss', { trim: false })
      })
    })

    resData.forEach(row => {
      totalEntry.totalCost += row.totalCost
      row.totalCost = Math.round(row.totalCost * 100) / 100
    })
    sortNames(resData)
    totalEntry.totalCost = Math.round(totalEntry.totalCost * 100) / 100

    res.send([...resData, totalEntry])
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

//Helper function to calculate sums of ExpT
const getExpTimeSum = expArr => {
  const expTimeSum = moment.duration()
  expArr.forEach(exp => {
    expTimeSum.add(exp.totalExpTime)
  })
  return expTimeSum.format('HH:mm:ss', { trim: false })
}

//Helper function to sort out alphabetically the first column with names
const sortNames = inputArray =>
  inputArray.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

exports.getInstrumentsCosting = async (req, res) => {
  try {
    const resData = await Instrument.find({ isActive: true }, 'name cost')
    res.send(resData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

exports.putInstrumentsCosting = async (req, res) => {
  try {
    const instrumentsArray = Object.keys(req.body)
    await Promise.all(
      instrumentsArray.map(async i => {
        await Instrument.findOneAndUpdate({ name: i }, { $set: { cost: req.body[i] } })
      })
    )
    res.send()
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
